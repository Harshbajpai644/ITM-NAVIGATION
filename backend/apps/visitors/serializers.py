"""Visitor Pass serializers."""
from rest_framework import serializers

from .models import VisitorPass


class VisitorPassSerializer(serializers.ModelSerializer):
    """Full serializer for admin operations."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = VisitorPass
        fields = [
            "id",
            "full_name",
            "mobile",
            "email",
            "department",
            "purpose",
            "destination",
            "visit_time",
            "status",
            "status_display",
            "admin_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "status_display"]


class VisitorPassCreateSerializer(serializers.ModelSerializer):
    """Public serializer — visitors cannot set status."""

    class Meta:
        model = VisitorPass
        fields = [
            "id",
            "full_name",
            "mobile",
            "email",
            "department",
            "purpose",
            "destination",
            "visit_time",
            "status",
            "created_at",
        ]
        read_only_fields = ["id", "status", "created_at"]

    def validate_mobile(self, value):
        digits = "".join(ch for ch in value if ch.isdigit())
        if len(digits) < 10:
            raise serializers.ValidationError("Enter a valid mobile number (at least 10 digits).")
        return value

    def validate_full_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Full name is required.")
        return value.strip()


class VisitorPassStatusSerializer(serializers.Serializer):
    """Approve / reject payload."""

    status = serializers.ChoiceField(choices=["approved", "rejected"])
    admin_notes = serializers.CharField(required=False, allow_blank=True, default="")