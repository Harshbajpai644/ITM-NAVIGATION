"""Building ViewSets — full CRUD with categories and search."""
from django.db.models import Q
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Building
from .serializers import BuildingSerializer


class BuildingViewSet(viewsets.ModelViewSet):
    """
    /api/buildings/

    Public (read):
      GET /api/buildings/
      GET /api/buildings/{id}/
      GET /api/buildings/categories/

    Admin (JWT + staff):
      POST   /api/buildings/
      PUT    /api/buildings/{id}/
      PATCH  /api/buildings/{id}/
      DELETE /api/buildings/{id}/
    """

    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    search_fields = ["name", "description", "category"]
    ordering_fields = ["name", "category", "created_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in ("list", "retrieve", "categories", "active"):
            return [AllowAny()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get("category")
        search = self.request.query_params.get("search")
        active_only = self.request.query_params.get("active")

        if category:
            qs = qs.filter(category=category.lower())
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__icontains=search)
            )
        if active_only and active_only.lower() in ("true", "1", "yes"):
            qs = qs.filter(is_active=True)
        # Non-admin list defaults to active buildings
        if self.action == "list" and not (
            self.request.user and self.request.user.is_staff
        ):
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=False, methods=["get"], url_path="categories")
    def categories(self, request):
        data = [
            {"value": value, "label": label}
            for value, label in Building.Category.choices
        ]
        return Response(data)

    @action(detail=False, methods=["get"], url_path="active")
    def active(self, request):
        qs = Building.objects.filter(is_active=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)