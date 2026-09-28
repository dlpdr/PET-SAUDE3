from rest_framework import serializers
from .models import Publication, PublicationImage, Comment, Like
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'role']

class CommentSerializer(serializers.ModelSerializer):
    autor = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'autor', 'texto', 'criado_em', 'ativo']
        read_only_fields = ['ativo']

class PublicationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationImage
        fields = ['id', 'imagem', 'descricao_acessivel', 'autorizacao_confirmada']

class PublicationSerializer(serializers.ModelSerializer):
    imagens = PublicationImageSerializer(many=True, read_only=True)
    autor = UserSimpleSerializer(read_only=True)
    novas_imagens = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    descricoes_imagens = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            'id', 'titulo', 'texto', 'autor', 'status', 'aprovado_por', 
            'data_atividade', 'data_publicacao', 'categoria', 'motivo_rejeicao',
            'imagens', 'novas_imagens', 'descricoes_imagens', 'criado_em', 'atualizado_em',
            'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = ['autor', 'aprovado_por', 'data_publicacao', 'motivo_rejeicao']

    def get_likes_count(self, obj):
        return obj.curtidas.count()
        
    def get_comments_count(self, obj):
        return obj.comentarios.filter(ativo=True).count()
        
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.curtidas.filter(usuario=request.user).exists()
        return False

    def create(self, validated_data):
        novas_imagens = validated_data.pop('novas_imagens', [])
        descricoes = validated_data.pop('descricoes_imagens', [])
        
        publicacao = super().create(validated_data)
        
        for i, imagem in enumerate(novas_imagens):
            descricao = descricoes[i] if i < len(descricoes) else 'Sem descrição'
            PublicationImage.objects.create(
                publicacao=publicacao,
                imagem=imagem,
                descricao_acessivel=descricao,
                autorizacao_confirmada=True
            )
            
        return publicacao

    def update(self, instance, validated_data):
        novas_imagens = validated_data.pop('novas_imagens', [])
        descricoes = validated_data.pop('descricoes_imagens', [])
        
        publicacao = super().update(instance, validated_data)
        
        for i, imagem in enumerate(novas_imagens):
            descricao = descricoes[i] if i < len(descricoes) else 'Sem descrição'
            PublicationImage.objects.create(
                publicacao=publicacao,
                imagem=imagem,
                descricao_acessivel=descricao,
                autorizacao_confirmada=True
            )
            
        return publicacao
