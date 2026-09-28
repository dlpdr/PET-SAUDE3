from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, MonitorListCreateView, GoogleLoginView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('monitors/', MonitorListCreateView.as_view(), name='monitors'),
    path('google/', GoogleLoginView.as_view(), name='google_login'),
]

