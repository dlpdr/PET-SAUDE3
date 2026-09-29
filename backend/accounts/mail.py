import hashlib
import logging
import secrets
from datetime import timedelta
from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.exceptions import APIException
from .models import AccountToken

logger = logging.getLogger(__name__)


class MailUnavailable(APIException):
    status_code = 503
    default_detail = 'Não foi possível enviar o e-mail. Tente novamente mais tarde.'


def deliver(subject, body, recipient):
    if not recipient:
        return False
    # Never report a console/dummy delivery as success in production.
    if not settings.DEBUG and settings.EMAIL_BACKEND in (
        'django.core.mail.backends.console.EmailBackend', 'django.core.mail.backends.dummy.EmailBackend',
    ):
        logger.error('SMTP não configurado para envio em produção.')
        return False
    try:
        return send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [recipient], fail_silently=False) == 1
    except Exception:
        # Avoid recording SMTP credentials or message bodies in logs.
        logger.error('Falha no envio de e-mail. Verifique a configuração do provedor.')
        return False


def send_account_link(user, purpose):
    raw = secrets.token_urlsafe(32)
    hours = 24 if purpose == 'confirm' else 1
    AccountToken.objects.filter(user=user, purpose=purpose).delete()
    AccountToken.objects.create(user=user, purpose=purpose,
        digest=hashlib.sha256(raw.encode()).hexdigest(), expires_at=timezone.now() + timedelta(hours=hours))
    route = 'confirmar-email' if purpose == 'confirm' else 'redefinir-senha'
    title = 'Confirme seu e-mail' if purpose == 'confirm' else 'Redefina sua senha'
    link = f'{settings.FRONTEND_URL.rstrip("/")}/{route}?token={raw}'
    if not deliver(f'{title} | PET Saúde',
        f'Olá {user.first_name},\n\n{title}: {link}\n\nEste link vale por {hours} hora(s) e só pode ser usado uma vez.\nSe não solicitou, ignore este e-mail.', user.email):
        raise MailUnavailable()
