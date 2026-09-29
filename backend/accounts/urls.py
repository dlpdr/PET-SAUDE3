from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, MonitorListCreateView, GoogleLoginView, ChangePasswordView, UserListView, UserDetailView
from .serializers import CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .token_views import ConfirmEmailView, ResendConfirmationView, RequestPasswordResetView, ResetPasswordView, AccountThrottle
from .views import CurrentUserView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [AccountThrottle]

urlpatterns = [
    path('me/', CurrentUserView.as_view(), name='current_user'),
    path('confirm-email/', ConfirmEmailView.as_view(), name='confirm_email'),
    path('resend-confirmation/', ResendConfirmationView.as_view(), name='resend_confirmation'),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('users/', UserListView.as_view(), name='users'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user_detail'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('monitors/', MonitorListCreateView.as_view(), name='monitors'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
]
