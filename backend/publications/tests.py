from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from .models import Publication
from unittest.mock import patch


class PublicationFlowTests(APITestCase):
    def setUp(self):
        users = get_user_model()
        self.monitor = users.objects.create_user(username='monitor', role='monitor')
        self.visitor = users.objects.create_user(username='visitor', role='visitante_registrado')
        self.admin = users.objects.create_user(username='admin', role='admin')
        self.draft = Publication.objects.create(titulo='Rascunho', texto='Texto', autor=self.monitor)
        self.published = Publication.objects.create(titulo='Atividade', texto='Texto',
            categoria='Ação Comunitária', autor=self.monitor, status='publicado', data_publicacao=timezone.now())

    def test_visitor_cannot_create_publication(self):
        self.client.force_authenticate(self.visitor)
        response = self.client.post('/api/publications/manage/', {
            'titulo': 'Tentativa', 'texto': 'Texto', 'categoria': 'Artigo Acadêmico'})
        self.assertEqual(response.status_code, 403)

    def test_monitor_cannot_self_approve(self):
        self.client.force_authenticate(self.monitor)
        response = self.client.patch(f'/api/publications/manage/{self.draft.id}/', {'status': 'publicado'})
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.client.post(f'/api/publications/manage/{self.draft.id}/approve/').status_code, 403)

    def test_public_list_excludes_drafts_even_for_admin(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/publications/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.published.id)
        self.assertEqual(self.client.get(f'/api/publications/{self.draft.id}/').status_code, 200)
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(f'/api/publications/{self.draft.id}/').status_code, 404)

    def test_pagination_and_search(self):
        for index in range(10):
            Publication.objects.create(titulo=f'Cartilha {index}', texto='Texto', autor=self.monitor,
                status='publicado', categoria='Cartilha Educativa', data_publicacao=timezone.now())
        response = self.client.get('/api/publications/', {'categoria': 'Cartilha Educativa'})
        self.assertEqual(response.data['count'], 10)
        self.assertEqual(len(response.data['results']), 9)
        response = self.client.get('/api/publications/', {'categoria': 'Cartilha Educativa', 'page': 2})
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(self.client.get('/api/publications/', {'search': 'Atividade'}).data['count'], 1)

    def test_rejection_and_resubmission(self):
        self.client.force_authenticate(self.admin)
        url = f'/api/publications/manage/{self.draft.id}/reject/'
        self.assertEqual(self.client.post(url, {'motivo': '  '}).status_code, 400)
        self.assertEqual(self.client.post(url, {'motivo': 'Rever texto'}).status_code, 200)
        self.client.force_authenticate(self.monitor)
        response = self.client.patch(f'/api/publications/manage/{self.draft.id}/', {'texto': 'Corrigido', 'status': 'pendente'})
        self.assertEqual(response.status_code, 200)
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.status, 'pendente')
        self.assertIsNone(self.draft.motivo_rejeicao)

    def test_comment_shape_and_like_persistence(self):
        self.client.force_authenticate(self.visitor)
        url = f'/api/publications/{self.published.id}/'
        self.assertEqual(self.client.post(url + 'comments/', {'texto': '   '}).status_code, 400)
        response = self.client.post(url + 'comments/', {'texto': 'Comentário real'})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['autor']['id'], self.visitor.id)
        self.assertIn('criado_em', response.data)
        self.assertEqual(self.client.post(url + 'like/').status_code, 200)
        detail = self.client.get(url).data
        self.assertTrue(detail['is_liked'])
        self.assertEqual(detail['likes_count'], 1)
        self.assertEqual(detail['comments_count'], 1)
        self.assertEqual(self.client.post(url + 'unlike/').status_code, 200)
        self.assertEqual(self.client.get(url).data['likes_count'], 0)

    def test_stats_require_admin(self):
        self.client.force_authenticate(self.monitor)
        self.assertEqual(self.client.get('/api/publications/manage/stats/').status_code, 403)
        self.client.force_authenticate(self.admin)
        response = self.client.get('/api/publications/manage/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['total_publicadas'], 1)
        self.assertEqual(response.data['total_usuarios'], 3)

    @patch('publications.views.deliver', return_value=True)
    def test_approval_sends_email(self, deliver):
        self.client.force_authenticate(self.admin)
        response = self.client.post(f'/api/publications/manage/{self.draft.id}/approve/')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['email_sent'])
        self.assertIn(self.draft.titulo, deliver.call_args.args[1])

    @patch('publications.views.deliver', return_value=False)
    def test_failed_notification_does_not_hide_rejection(self, deliver):
        self.client.force_authenticate(self.admin)
        response = self.client.post(f'/api/publications/manage/{self.draft.id}/reject/', {'motivo': 'Corrigir conteúdo'})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data['email_sent'])
        self.draft.refresh_from_db()
        self.assertEqual(self.draft.status, 'rejeitado')
        self.assertIn('Corrigir conteúdo', deliver.call_args.args[1])
