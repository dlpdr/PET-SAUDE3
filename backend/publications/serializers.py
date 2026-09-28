from rest_framework import serializers
from .models import Publication, PublicationImage

class PublicationImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationImage
        fields = ['id', 'imagem', 'descricao_acessivel', 'autorizacao_confirmada']

class PublicationSerializer(serializers.ModelSerializer):
    imagens = PublicationImageSerializer(many=True, read_only=True)
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

    class Meta:
        model = Publication
        fields = [
            'id', 'titulo', 'texto', 'autor', 'status', 'aprovado_por', 
            'data_atividade', 'data_publicacao', 'categoria', 'motivo_rejeicao',
            'imagens', 'novas_imagens', 'descricoes_imagens', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['autor', 'aprovado_por', 'data_publicacao', 'motivo_rejeicao']

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
