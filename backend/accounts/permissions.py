from rest_framework import permissions

class IsAdminRole(permissions.BasePermission):
    """
    Permissão que verifica se o usuário autenticado possui a role 'admin'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')
