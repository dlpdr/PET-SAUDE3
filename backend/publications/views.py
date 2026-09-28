from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Publication, Like, Comment
from .serializers import PublicationSerializer, CommentSerializer
from .permissions import IsAuthorOrAdmin, IsAdminUserRole

class PublicationViewSet(viewsets.ModelViewSet):
    serializer_class = PublicationSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'categoria']
    search_fields = ['titulo', 'texto']
    ordering_fields = ['data_publicacao', 'criado_em']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Publication.objects.all()
        return Publication.objects.filter(autor=user)

    def perform_create(self, serializer):
        user = self.request.user
        status_inicial = 'pendente' if user.role == 'monitor' else 'publicado'
        
        if self.request.data.get('status') == 'rascunho':
            status_inicial = 'rascunho'

        data_publicacao = timezone.now() if status_inicial == 'publicado' else None

        serializer.save(
            autor=user,
            status=status_inicial,
            data_publicacao=data_publicacao
        )

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        # Rule 4 & 5: When monitor edits rejected or published, it returns to pending
        novo_status = serializer.validated_data.get('status', instance.status)
        
        if user.role == 'monitor' and instance.status in ['rejeitado', 'publicado']:
            if novo_status != 'rascunho':
                serializer.save(status='pendente', motivo_rejeicao=None)
                return

        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        publication = self.get_object()
        publication.status = 'publicado'
        publication.aprovado_por = request.user
        publication.data_publicacao = timezone.now()
        publication.motivo_rejeicao = None
        publication.save()
        return Response({'status': 'Publicação aprovada'})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        publication = self.get_object()
        motivo = request.data.get('motivo', 'Motivo não informado.')
        publication.status = 'rejeitado'
        publication.motivo_rejeicao = motivo
        publication.save()
        return Response({'status': 'Publicação rejeitada'})

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUserRole])
    def pending(self, request):
        pending_pubs = Publication.objects.filter(status='pendente').order_by('criado_em')
        serializer = self.get_serializer(pending_pubs, many=True)
        return Response(serializer.data)


class PublicPublicationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PublicationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['titulo', 'texto', 'autor__first_name', 'autor__last_name']
    ordering_fields = ['data_publicacao']
    
    def get_queryset(self):
        return Publication.objects.filter(status='publicado').order_by('-data_publicacao')
        
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        publication = self.get_object()
        like, created = Like.objects.get_or_create(publicacao=publication, usuario=request.user)
        if not created:
            return Response({'status': 'Você já curtiu esta publicação.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'status': 'Curtida adicionada.'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def unlike(self, request, pk=None):
        publication = self.get_object()
        try:
            like = Like.objects.get(publicacao=publication, usuario=request.user)
            like.delete()
            return Response({'status': 'Curtida removida.'})
        except Like.DoesNotExist:
            return Response({'status': 'Curtida não encontrada.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get', 'post'], permission_classes=[AllowAny])
    def comments(self, request, pk=None):
        publication = self.get_object()
        
        if request.method == 'GET':
            comments = publication.comentarios.filter(ativo=True).order_by('-criado_em')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data)
            
        elif request.method == 'POST':
            if not request.user.is_authenticated:
                return Response({'error': 'Você precisa estar logado para comentar.'}, status=status.HTTP_401_UNAUTHORIZED)
                
            texto = request.data.get('texto')
            if not texto:
                return Response({'error': 'O texto do comentário é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
                
            comment = Comment.objects.create(
                publicacao=publication,
                autor=request.user,
                texto=texto
            )
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
