from django.contrib import admin

from .models import Building


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "latitude",
        "longitude",
        "floor_count",
        "is_active",
        "updated_at",
    )
    list_filter = ("category", "is_active")
    search_fields = ("name", "description")
    readonly_fields = ("created_at", "updated_at")
    ordering = ("name",)