"""Root URL configuration for ITM Campus Navigator."""
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/visitor-pass/", include("apps.visitors.urls")),
    path("api/buildings/", include("apps.buildings.urls")),
    path("api/admin/", include("apps.accounts.urls")),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]