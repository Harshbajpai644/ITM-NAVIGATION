"""Building serializers."""
from rest_framework import serializers

from .models import Building


class BuildingSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source="get_category_display", read_only=True)

    class Meta:
        model = Building
        fields = [
            "id",
            "name",
            "category",
            "category_display",
            "description",
            "latitude",
            "longitude",
            "floor_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "category_display"]

    def validate_latitude(self, value):
        if value < -90 or value > 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if value < -180 or value > 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value


class BuildingCategorySerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()