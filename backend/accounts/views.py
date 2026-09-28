from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import User
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

import secrets
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from .permissions import IsAdminRole
from .serializers import MonitorSerializer

class MonitorListCreateView(generics.ListCreateAPIView):
    serializer_class = MonitorSerializer
    permission_classes = [IsAdminRole]

    def get_queryset(self):
        return User.objects.filter(role='monitor')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        temp_password = secrets.token_urlsafe(8)
        user = serializer.save(
            role='monitor',
            criado_por=self.request.user
        )
        user.set_password(temp_password)
        user.save()
        
        try:
            send_mail(
                'Sua conta de Monitor no PET Saúde',
                f'Olá {user.first_name},\n\nSua conta de monitor foi criada com sucesso.\nSua senha temporária é: {temp_password}\n\nFaça login e altere sua senha.',
                'admin@petsaude.com',
                [user.email],
                fail_silently=True,
            )
        except Exception:
            pass
            
        headers = self.get_success_headers(serializer.data)
        response_data = serializer.data
        response_data['temp_password'] = temp_password
        return Response(response_data, status=201, headers=headers)

class GoogleLoginView(APIView):
    permission_classes = []

    def post(self, request):
        token = request.data.get('id_token')
        if not token:
            return Response({'error': 'id_token is required'}, status=400)
        try:
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID, clock_skew_in_seconds=10
            )
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            username = email.split('@')[0]

            user, created = User.objects.get_or_create(email=email, defaults={
                'username': username,
                'first_name': first_name,
                'last_name': last_name,
                'role': 'visitante_registrado'
            })

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                }
            })
        except ValueError:
            return Response({'error': 'Invalid token'}, status=400)
