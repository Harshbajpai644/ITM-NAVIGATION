"""Admin auth and dashboard endpoints under /api/admin/."""
from django.conf import settings
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.visitors.models import VisitorPass
from apps.visitors.serializers import VisitorPassSerializer

from .serializers import AdminLoginSerializer, AdminUserSerializer


def tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


class AdminLoginView(APIView):
    """POST /api/admin/login/ — JWT login for staff users."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        tokens = tokens_for_user(user)
        return Response(
            {
                "user": AdminUserSerializer(user).data,
                "tokens": tokens,
            }
        )


class AdminMeView(APIView):
    """GET /api/admin/me/ — current admin profile."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        return Response(AdminUserSerializer(request.user).data)


class AdminDashboardView(APIView):
    """GET /api/admin/dashboard/ — summary stats + recent visitors."""

    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        qs = VisitorPass.objects.all()
        recent = qs.order_by("-created_at")[:10]
        return Response(
            {
                "stats": {
                    "total": qs.count(),
                    "pending": qs.filter(status=VisitorPass.Status.PENDING).count(),
                    "approved": qs.filter(status=VisitorPass.Status.APPROVED).count(),
                    "rejected": qs.filter(status=VisitorPass.Status.REJECTED).count(),
                },
                "recent_visitors": VisitorPassSerializer(recent, many=True).data,
                "campus": {
                    "name": settings.CAMPUS_NAME,
                    "latitude": settings.CAMPUS_LAT,
                    "longitude": settings.CAMPUS_LNG,
                },
            }
        )


class CampusInfoView(APIView):
    """GET /api/admin/campus-info/ — public campus map defaults."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response(
            {
                "name": settings.CAMPUS_NAME,
                "latitude": settings.CAMPUS_LAT,
                "longitude": settings.CAMPUS_LNG,
            }
        )


class HealthCheckView(APIView):
    """GET /api/admin/health/ — service health probe."""

    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request):
        return Response({"status": "ok", "service": "ITM Campus Navigator API"})