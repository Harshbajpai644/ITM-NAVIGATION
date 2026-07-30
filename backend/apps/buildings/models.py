"""Campus building models."""
from django.db import models


class Building(models.Model):
    """Campus building / landmark for navigation."""

    class Category(models.TextChoices):
        ACADEMIC = "academic", "Academic"
        ADMINISTRATIVE = "administrative", "Administrative"
        HOSTEL = "hostel", "Hostel"
        LIBRARY = "library", "Library"
        LABORATORY = "laboratory", "Laboratory"
        CAFETERIA = "cafeteria", "Cafeteria"
        SPORTS = "sports", "Sports"
        PARKING = "parking", "Parking"
        GATE = "gate", "Gate / Entrance"
        OTHER = "other", "Other"

    name = models.CharField(max_length=150)
    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.ACADEMIC,
        db_index=True,
    )
    description = models.TextField(blank=True, default="")
    latitude = models.DecimalField(max_digits=10, decimal_places=7)
    longitude = models.DecimalField(max_digits=10, decimal_places=7)
    floor_count = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        verbose_name = "Building"
        verbose_name_plural = "Buildings"
        indexes = [
            models.Index(fields=["category", "name"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"