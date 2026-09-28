from django.db import models
from django.conf import settings

class Publication(models.Model):
    STATUS_CHOICES = (
        ('rascunho', 'Rascunho'),
        ('pendente', 'Pendente'),
        ('publicado', 'Publicado'),
        ('rejeitado', 'Rejeitado'),
    )
    titulo = models.CharField(max_length=255)
    texto = models.TextField()
    autor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='publicacoes')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='rascunho')
    aprovado_por = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='publicacoes_aprovadas')
    data_atividade = models.DateField(null=True, blank=True)
    data_publicacao = models.DateTimeField(null=True, blank=True)
    categoria = models.CharField(max_length=100)
    motivo_rejeicao = models.TextField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.titulo

class PublicationImage(models.Model):
    publicacao = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='imagens')
    imagem = models.ImageField(upload_to='publications/')
    descricao_acessivel = models.CharField(max_length=255)
    autorizacao_confirmada = models.BooleanField(default=False)

    def __str__(self):
        return f"Imagem da publicação: {self.publicacao.titulo}"
