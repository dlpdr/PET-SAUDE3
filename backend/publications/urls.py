from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicationViewSet, PublicPublicationViewSet

router = DefaultRouter()
router.register(r'manage', PublicationViewSet, basename='manage-publications')
router.register(r'', PublicPublicationViewSet, basename='public-publications')

urlpatterns = [
    path('', include(router.urls)),
]
