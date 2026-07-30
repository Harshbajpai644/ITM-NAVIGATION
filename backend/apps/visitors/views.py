"""Visitor Pass ViewSets."""
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import VisitorPass
from .serializers import (
    VisitorPassCreateSerializer,
    VisitorPassSerializer,
    VisitorPassStatusSerializer,
)


class VisitorPassViewSet(viewsets.ModelViewSet):
    """
    /api/visitor-pass/

    Public:
      POST   /api/visitor-pass/          — submit visitor pass
      GET    /api/visitor-pass/{id}/     — check own pass status (by id)

    Admin (JWT + staff):
      GET    /api/visitor-pass/          — list / search / filter
      PATCH  /api/visitor-pass/{id}/approve/ — approve
      PATCH  /api/visitor-pass/{id}/reject/  — reject
      DELETE /api/visitor-pass/{id}/     — delete
    """

    queryset = VisitorPass.objects.all()
    search_fields = ["full_name", "email", "mobile", "department", "destination", "purpose"]
    ordering_fields = ["created_at", "visit_time", "status", "full_name"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return VisitorPassCreateSerializer
        if self.action in ("approve", "reject", "update_status"):
            return VisitorPassStatusSerializer
        return VisitorPassSerializer

    def get_permissions(self):
        if self.action in ("create", "retrieve"):
            return [AllowAny()]
        if self.action in ("list", "destroy", "approve", "reject", "update_status", "stats"):
            return [IsAuthenticated(), IsAdminUser()]
        return [IsAuthenticated(), IsAdminUser()]

    def get_queryset(self):
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        department = self.request.query_params.get("department")
        search = self.request.query_params.get("search")

        if status_filter:
            qs = qs.filter(status=status_filter.lower())
        if department:
            qs = qs.filter(department__icontains=department)
        if search:
            qs = qs.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(mobile__icontains=search)
                | Q(department__icontains=search)
                | Q(destination__icontains=search)
                | Q(purpose__icontains=search)
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        visitor = serializer.save()
        return Response(
            VisitorPassSerializer(visitor).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["patch"], url_path="approve")
    def approve(self, request, pk=None):
        visitor = self.get_object()
        notes = request.data.get("admin_notes", "")
        visitor.status = VisitorPass.Status.APPROVED
        visitor.admin_notes = notes
        visitor.save(update_fields=["status", "admin_notes", "updated_at"])
        return Response(VisitorPassSerializer(visitor).data)

    @action(detail=True, methods=["patch"], url_path="reject")
    def reject(self, request, pk=None):
        visitor = self.get_object()
        notes = request.data.get("admin_notes", "")
        visitor.status = VisitorPass.Status.REJECTED
        visitor.admin_notes = notes
        visitor.save(update_fields=["status", "admin_notes", "updated_at"])
        return Response(VisitorPassSerializer(visitor).data)

    @action(detail=False, methods=["get"], url_path="stats")
    def stats(self, request):
        qs = VisitorPass.objects.all()
        return Response(
            {
                "total": qs.count(),
                "pending": qs.filter(status=VisitorPass.Status.PENDING).count(),
                "approved": qs.filter(status=VisitorPass.Status.APPROVED).count(),
                "rejected": qs.filter(status=VisitorPass.Status.REJECTED).count(),
            }
        )