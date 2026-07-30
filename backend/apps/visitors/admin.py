from django.contrib import admin

from .models import VisitorPass


@admin.register(VisitorPass)
class VisitorPassAdmin(admin.ModelAdmin):
    list_display = (
        "full_name",
        "mobile",
        "email",
        "department",
        "destination",
        "visit_time",
        "status",
        "created_at",
    )
    list_filter = ("status", "department", "created_at")
    search_fields = ("full_name", "email", "mobile", "destination")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("-created_at",)