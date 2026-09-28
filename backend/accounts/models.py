from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('visitante_registrado', 'Visitante Registrado'),
        ('monitor', 'Monitor'),
        ('admin', 'Admin'),
    )
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='visitante_registrado')
    criado_por = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='usuarios_criados')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
