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
    imagem_capa = serializers.ImageField(
        write_only=True,
        required=False
    )
    novas_imagens = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False
    )
    descricoes_imagens = serializers.ListField(
        child=serializers.CharField(max_length=255),
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
            'imagens', 'imagem_capa', 'novas_imagens', 'descricoes_imagens', 'criado_em', 'atualizado_em',
            'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = ['autor', 'aprovado_por', 'data_publicacao', 'motivo_rejeicao']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        first_img = instance.imagens.first()
        ret['imagem_capa'] = first_img.imagem.url if first_img and first_img.imagem else None
        return ret

    def get_likes_count(self, obj):
        return obj.curtidas.count()

    def validate_status(self, value):
        request = self.context.get('request')
        if request and request.user.role != 'admin' and value not in ('rascunho', 'pendente'):
            raise serializers.ValidationError('Envie a publicação para aprovação.')
        return value

    def validate(self, attrs):
        existing = self.instance.imagens.count() if self.instance else 0
        capa_count = 1 if attrs.get('imagem_capa') else 0
        novas_count = len(attrs.get('novas_imagens', []))
        if existing + novas_count + capa_count > 5:
            raise serializers.ValidationError({'novas_imagens': 'O limite é de cinco imagens por publicação.'})
        return attrs
        
    def get_comments_count(self, obj):
        return obj.comentarios.filter(ativo=True).count()
        
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.curtidas.filter(usuario=request.user).exists()
        return False

    def create(self, validated_data):
        imagem_capa = validated_data.pop('imagem_capa', None)
        novas_imagens = validated_data.pop('novas_imagens', [])
        descricoes = validated_data.pop('descricoes_imagens', [])
        
        publicacao = super().create(validated_data)
        
        if imagem_capa:
            PublicationImage.objects.create(
                publicacao=publicacao,
                imagem=imagem_capa,
                descricao_acessivel='Imagem de capa',
                autorizacao_confirmada=True
            )

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
        imagem_capa = validated_data.pop('imagem_capa', None)
        novas_imagens = validated_data.pop('novas_imagens', [])
        descricoes = validated_data.pop('descricoes_imagens', [])
        
        publicacao = super().update(instance, validated_data)
        
        if imagem_capa:
            PublicationImage.objects.create(
                publicacao=publicacao,
                imagem=imagem_capa,
                descricao_acessivel='Imagem de capa',
                autorizacao_confirmada=True
            )

        for i, imagem in enumerate(novas_imagens):
            descricao = descricoes[i] if i < len(descricoes) else 'Sem descrição'
            PublicationImage.objects.create(
                publicacao=publicacao,
                imagem=imagem,
                descricao_acessivel=descricao,
                autorizacao_confirmada=True
            )
            
        return publicacao
