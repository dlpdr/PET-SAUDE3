from urllib.parse import urlparse
from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count
from django.db.models.functions import Lower
from accounts.models import User


class Command(BaseCommand):
    help = 'Verifica configuração de produção e duplicidade de e-mails sem alterar dados.'

    def handle(self, *args, **options):
        issues = []
        if settings.DEBUG:
            issues.append('Defina DEBUG=False em produção.')
        if len(settings.SECRET_KEY) < 50 or settings.SECRET_KEY.startswith(('chave-insegura', 'sua_secret')):
            issues.append('Configure uma SECRET_KEY forte e privada.')
        if settings.EMAIL_BACKEND != 'django.core.mail.backends.smtp.EmailBackend':
            issues.append('Configure EMAIL_HOST e as credenciais SMTP.')
        elif not settings.EMAIL_HOST_USER or not settings.EMAIL_HOST_PASSWORD:
            issues.append('As credenciais SMTP estão incompletas.')
        if getattr(settings, 'EMAIL_USE_SSL', False) and getattr(settings, 'EMAIL_USE_TLS', False):
            issues.append('Escolha SSL ou STARTTLS, não os dois.')
        if urlparse(settings.FRONTEND_URL).scheme != 'https':
            issues.append('FRONTEND_URL precisa apontar para o frontend HTTPS em produção.')
        if '@localhost' in settings.DEFAULT_FROM_EMAIL:
            issues.append('Configure DEFAULT_FROM_EMAIL com um remetente verificado.')
        duplicates = User.objects.exclude(email='').annotate(normalized=Lower('email')).values('normalized').annotate(total=Count('id')).filter(total__gt=1).count()
        if duplicates:
            issues.append(f'Existem {duplicates} e-mails duplicados. Resolva as contas antes de aplicar a migração 0002, sem excluir dados automaticamente.')
        if issues:
            raise CommandError('\n'.join(issues))
        self.stdout.write(self.style.SUCCESS('Pré-verificações passaram. Ainda é necessário testar SMTP, HTTPS e os fluxos reais.'))
