from rest_framework.test import APITestCase
from .models import User
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch
import re
from .models import AccountToken


class UserManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username='admin', role='admin', password='Old-Password-472!')
        self.visitor = User.objects.create_user(username='visitor')

    def test_user_management_requires_admin(self):
        self.client.force_authenticate(self.visitor)
        self.assertEqual(self.client.get('/api/auth/users/').status_code, 403)
        self.client.force_authenticate(self.admin)
        self.assertEqual(self.client.get('/api/auth/users/').status_code, 200)
        response = self.client.patch(f'/api/auth/users/{self.visitor.id}/', {'role': 'monitor'})
        self.assertEqual(response.status_code, 200)
        self.visitor.refresh_from_db()
        self.assertEqual(self.visitor.role, 'monitor')

    def test_admin_cannot_remove_own_access(self):
        self.client.force_authenticate(self.admin)
        url = f'/api/auth/users/{self.admin.id}/'
        self.assertEqual(self.client.patch(url, {'role': 'monitor'}).status_code, 400)
        self.assertEqual(self.client.delete(url).status_code, 400)

    def test_password_change_validates_password(self):
        self.client.force_authenticate(self.admin)
        url = '/api/auth/change-password/'
        response = self.client.put(url, {'old_password': 'Old-Password-472!', 'new_password': '123'})
        self.assertEqual(response.status_code, 400)
        response = self.client.put(url, {'old_password': 'Old-Password-472!', 'new_password': 'New-Password-945!'})
        self.assertEqual(response.status_code, 200)
        self.admin.refresh_from_db()
        self.assertTrue(self.admin.check_password('New-Password-945!'))

    def test_monitor_creation_uses_requested_password(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/auth/monitors/', {'username': 'monitor',
            'email': 'monitor@example.com', 'password': 'Requested-Password-357!'})
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.get(username='monitor').check_password('Requested-Password-357!'))
        self.assertTrue(response.data['email_sent'])

    def test_monitor_weak_password_returns_field_error_without_creating_user(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/auth/monitors/', {'username': 'short-password-monitor',
            'email': 'short@example.com', 'password': 'abc1234'})
        self.assertEqual(response.status_code, 400)
        self.assertIn('password', response.data)
        self.assertFalse(User.objects.filter(username='short-password-monitor').exists())

    def test_monitor_can_be_created_without_a_password(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post('/api/auth/monitors/', {'username': 'generated-monitor', 'email': 'generated@example.com'})
        self.assertEqual(response.status_code, 201)
        user = User.objects.get(username='generated-monitor')
        self.assertTrue(user.check_password(response.data['temp_password']))
        self.assertEqual(user.role, 'monitor')


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', FRONTEND_URL='https://portal.example')
class AccountEmailTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.payload = {'username': 'new-user', 'email': 'new@example.com',
            'password': 'Complex-Test-Password-829!', 'password_confirm': 'Complex-Test-Password-829!'}

    def register(self):
        response = self.client.post('/api/auth/register/', self.payload)
        self.assertEqual(response.status_code, 201, response.data)
        return re.search(r'token=([\w-]+)', mail.outbox[-1].body).group(1)

    def test_confirmation_is_required_and_single_use(self):
        token = self.register()
        user = User.objects.get(username='new-user')
        self.assertFalse(user.is_active)
        self.assertNotEqual(AccountToken.objects.get(user=user).digest, token)
        login = {'username': user.username, 'password': self.payload['password']}
        self.assertEqual(self.client.post('/api/auth/login/', login).status_code, 401)
        self.assertEqual(self.client.get('/api/auth/confirm-email/', {'token': token}).status_code, 405)
        self.assertEqual(self.client.post('/api/auth/confirm-email/', {'token': token}).status_code, 200)
        self.assertEqual(self.client.post('/api/auth/confirm-email/', {'token': token}).status_code, 400)
        self.assertEqual(self.client.post('/api/auth/login/', login).status_code, 200)

    def test_expired_link_and_resend(self):
        old = self.register()
        AccountToken.objects.update(expires_at=timezone.now() - timedelta(minutes=1))
        self.assertEqual(self.client.post('/api/auth/confirm-email/', {'token': old}).status_code, 400)
        self.assertEqual(self.client.post('/api/auth/resend-confirmation/', {'email': self.payload['email']}).status_code, 200)
        new = re.search(r'token=([\w-]+)', mail.outbox[-1].body).group(1)
        self.assertNotEqual(old, new)
        self.assertEqual(self.client.post('/api/auth/confirm-email/', {'token': new}).status_code, 200)

    @patch('accounts.mail.deliver', return_value=False)
    def test_failed_email_rolls_back_registration(self, _deliver):
        self.assertEqual(self.client.post('/api/auth/register/', self.payload).status_code, 503)
        self.assertFalse(User.objects.filter(username='new-user').exists())
        self.assertEqual(AccountToken.objects.count(), 0)

    def test_reset_validates_password_and_consumes_token(self):
        user = User.objects.create_user(username='active', email='active@example.com', password='Old-Password-937!')
        response = self.client.post('/api/auth/request-password-reset/', {'email': user.email})
        self.assertEqual(response.status_code, 200)
        token = re.search(r'token=([\w-]+)', mail.outbox[-1].body).group(1)
        endpoint = '/api/auth/reset-password/'
        self.assertEqual(self.client.post(endpoint, {'token': token, 'password': '123'}).status_code, 400)
        payload = {'token': token, 'password': 'Changed-Password-478!'}
        self.assertEqual(self.client.post(endpoint, payload).status_code, 200)
        self.assertEqual(self.client.post(endpoint, payload).status_code, 400)
        user.refresh_from_db()
        self.assertTrue(user.check_password(payload['password']))

    def test_unknown_email_has_generic_response(self):
        response = self.client.post('/api/auth/request-password-reset/', {'email': 'unknown@example.com'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('Se houver', response.data['detail'])

    def test_duplicate_email_is_case_insensitive(self):
        self.register()
        self.payload.update(username='another', email='NEW@example.com')
        self.assertEqual(self.client.post('/api/auth/register/', self.payload).status_code, 400)

    def test_login_accepts_email(self):
        User.objects.create_user(username='different-name', email='mail@example.com', password='Known-Password-374!')
        response = self.client.post('/api/auth/login/', {'username': 'MAIL@example.com', 'password': 'Known-Password-374!'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['username'], 'different-name')

    @override_settings(GOOGLE_CLIENT_ID='test-client')
    @patch('accounts.views.id_token.verify_oauth2_token')
    def test_google_subject_reuse_and_inactive_account(self, verify):
        verify.return_value = {'sub': 'google-subject', 'email': 'google@example.com', 'email_verified': True}
        first = self.client.post('/api/auth/google/', {'id_token': 'test'})
        self.assertEqual(first.status_code, 200)
        self.assertEqual(self.client.post('/api/auth/google/', {'id_token': 'test'}).status_code, 200)
        self.assertEqual(User.objects.filter(google_subject='google-subject').count(), 1)
        User.objects.filter(google_subject='google-subject').update(is_active=False)
        self.assertEqual(self.client.post('/api/auth/google/', {'id_token': 'test'}).status_code, 403)
