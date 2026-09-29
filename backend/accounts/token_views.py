import hashlib
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from .models import AccountToken, User
from .mail import send_account_link


class AccountThrottle(AnonRateThrottle):
    rate = '10/hour'


class PublicAccountView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [AccountThrottle]


class EmailInput(serializers.Serializer):
    email = serializers.EmailField()


class ResendConfirmationView(PublicAccountView):
    purpose = 'confirm'

    @transaction.atomic
    def post(self, request):
        serializer = EmailInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        users = User.objects.select_for_update().filter(email__iexact=serializer.validated_data['email'])
        user = users.filter(is_active=self.purpose == 'reset').first()
        # An inactive account must actually be awaiting verification, not disabled by an admin.
        if user and (self.purpose == 'reset' or user.account_tokens.filter(purpose='confirm').exists()):
            send_account_link(user, self.purpose)
        return Response({'detail': 'Se houver uma conta elegível, enviaremos um link para o e-mail informado.'})


class RequestPasswordResetView(ResendConfirmationView):
    purpose = 'reset'


class ConfirmEmailView(PublicAccountView):
    purpose = 'confirm'

    @transaction.atomic
    def post(self, request):
        raw = request.data.get('token')
        if not isinstance(raw, str) or not 20 <= len(raw) <= 200:
            return Response({'detail': 'Link inválido ou expirado.'}, status=400)
        digest = hashlib.sha256(raw.encode()).hexdigest()
        candidate = AccountToken.objects.filter(digest=digest, purpose=self.purpose).first()
        if not candidate:
            return Response({'detail': 'Link inválido, expirado ou já utilizado.'}, status=400)
        # Use the same lock order as resending: user first, token second.
        user = User.objects.select_for_update().filter(pk=candidate.user_id).first()
        if not user:
            return Response({'detail': 'Link inválido ou expirado.'}, status=400)
        token = AccountToken.objects.select_for_update().filter(
            digest=digest, purpose=self.purpose, expires_at__gt=timezone.now()).first()
        if not token:
            return Response({'detail': 'Link inválido, expirado ou já utilizado.'}, status=400)
        if self.purpose == 'confirm':
            if user.is_active:
                return Response({'detail': 'Este link já foi utilizado.'}, status=400)
            user.is_active = True
            user.save(update_fields=['is_active'])
        else:
            password = request.data.get('password')
            if not user.is_active or not isinstance(password, str):
                return Response({'detail': 'Dados inválidos.'}, status=400)
            try:
                validate_password(password, user)
            except DjangoValidationError as error:
                return Response({'password': error.messages}, status=400)
            user.set_password(password)
            user.save(update_fields=['password'])
        user.account_tokens.filter(purpose=self.purpose).delete()
        return Response({'detail': 'E-mail confirmado. Você já pode entrar.' if self.purpose == 'confirm' else 'Senha atualizada. Entre com sua nova senha.'})


class ResetPasswordView(ConfirmEmailView):
    purpose = 'reset'
