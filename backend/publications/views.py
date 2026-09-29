from django.utils import timezone
from rest_framework import viewsets, status, filters, pagination
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import get_user_model
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Publication, Like, Comment
from .serializers import PublicationSerializer, CommentSerializer
from .permissions import IsAuthorOrAdmin, IsAdminUserRole
from accounts.mail import deliver
from django.db import transaction

class PublicationViewSet(viewsets.ModelViewSet):
    serializer_class = PublicationSerializer
    permission_classes = [IsAuthenticated, IsAuthorOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'categoria']
    search_fields = ['titulo', 'texto']
    ordering_fields = ['data_publicacao', 'criado_em']

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @transaction.atomic
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        queryset = Publication.objects.all()
        if self.action in ('update', 'partial_update'):
            queryset = queryset.select_for_update()
        if user.role == 'admin':
            return queryset
        return queryset.filter(autor=user)

    def perform_create(self, serializer):
        user = self.request.user
        req_status = self.request.data.get('status')
        
        if req_status in ['rascunho', 'pendente']:
            status_inicial = req_status
        else:
            status_inicial = 'pendente' if user.role == 'monitor' else 'publicado'

        data_publicacao = timezone.now() if status_inicial == 'publicado' else None

        serializer.save(
            autor=user,
            status=status_inicial,
            data_publicacao=data_publicacao
        )

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        if user.role != 'admin' and instance.status not in ('rascunho', 'rejeitado'):
            raise PermissionDenied('Somente rascunhos e publicações rejeitadas podem ser editados.')
        
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
        email_sent = deliver('Publicação aprovada | PET Saúde',
            f'Sua publicação "{publication.titulo}" foi aprovada e está disponível no portal.', publication.autor.email)
        return Response({'status': 'Publicação aprovada', 'email_sent': email_sent})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        publication = self.get_object()
        motivo = request.data.get('motivo', '')
        if not isinstance(motivo, str) or not motivo.strip():
            return Response({'motivo': 'Informe o motivo da rejeição.'}, status=status.HTTP_400_BAD_REQUEST)
        motivo = motivo.strip()
        publication.status = 'rejeitado'
        publication.motivo_rejeicao = motivo
        publication.save()
        email_sent = deliver('Publicação precisa de correções | PET Saúde',
            f'Sua publicação "{publication.titulo}" foi rejeitada.\n\nMotivo: {motivo}\n\nCorrija o conteúdo e envie novamente pelo painel.', publication.autor.email)
        return Response({'status': 'Publicação rejeitada', 'email_sent': email_sent})

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUserRole])
    def pending(self, request):
        pending_pubs = Publication.objects.filter(status='pendente').order_by('criado_em')
        serializer = self.get_serializer(pending_pubs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminUserRole])
    def stats(self, request):
        publications = Publication.objects.all()
        users = get_user_model().objects.all()
        return Response({
            'total_publicacoes': publications.count(),
            'total_publicadas': publications.filter(status='publicado').count(),
            'total_pendentes': publications.filter(status='pendente').count(),
            'total_curtidas': Like.objects.count(),
            'total_comentarios': Comment.objects.filter(ativo=True).count(),
            'total_usuarios': users.count(),
            'total_monitores': users.filter(role='monitor', is_active=True).count(),
        })


class PublicPagination(pagination.PageNumberPagination):
    page_size = 9


class PublicPublicationViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = PublicPagination
    serializer_class = PublicationSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria']
    search_fields = ['titulo', 'texto', 'autor__first_name', 'autor__last_name']
    ordering_fields = ['data_publicacao']
    
    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        if self.action == 'list':
            return Publication.objects.filter(status='publicado').order_by('-data_publicacao', '-id')
        if user.is_authenticated:
            if user.role == 'admin':
                return Publication.objects.all().order_by('-data_publicacao')
            return Publication.objects.filter(Q(status='publicado') | Q(autor=user)).order_by('-data_publicacao')
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
            if not isinstance(texto, str) or not texto.strip():
                return Response({'error': 'O texto do comentário é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
                
            comment = Comment.objects.create(
                publicacao=publication,
                autor=request.user,
                texto=texto.strip()
            )
            serializer = CommentSerializer(comment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
