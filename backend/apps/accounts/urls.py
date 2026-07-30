"""Admin API routes — /api/admin/."""
from django.urls import path

from .views import (
    AdminDashboardView,
    AdminLoginView,
    AdminMeView,
    CampusInfoView,
    HealthCheckView,
)

urlpatterns = [
    path("login/", AdminLoginView.as_view(), name="admin-login"),
    path("me/", AdminMeView.as_view(), name="admin-me"),
    path("dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("campus-info/", CampusInfoView.as_view(), name="campus-info"),
    path("health/", HealthCheckView.as_view(), name="health"),
]