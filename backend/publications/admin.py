from django.contrib import admin
from .models import Publication, PublicationImage

class PublicationImageInline(admin.TabularInline):
    model = PublicationImage
    extra = 1

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'autor', 'status', 'data_atividade', 'data_publicacao')
    list_filter = ('status', 'categoria', 'data_publicacao')
    search_fields = ('titulo', 'texto')
    inlines = [PublicationImageInline]
