"""Visitor Pass URL routing."""
from rest_framework.routers import DefaultRouter

from .views import VisitorPassViewSet

router = DefaultRouter()
router.register(r"", VisitorPassViewSet, basename="visitor-pass")

urlpatterns = router.urls