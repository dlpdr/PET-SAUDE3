from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower

class User(AbstractUser):
    class Meta(AbstractUser.Meta):
        constraints = [models.UniqueConstraint(Lower('email'), condition=~models.Q(email=''), name='unique_nonempty_user_email')]

    ROLE_CHOICES = (
        ('visitante_registrado', 'Visitante Registrado'),
        ('monitor', 'Monitor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='visitante_registrado')
    google_subject = models.CharField(max_length=255, unique=True, null=True, blank=True)
    criado_por = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='usuarios_criados')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class AccountToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='account_tokens')
    purpose = models.CharField(max_length=20, choices=[('confirm', 'Confirmar e-mail'), ('reset', 'Redefinir senha')])
    digest = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
