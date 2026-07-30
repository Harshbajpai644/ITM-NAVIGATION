"""Visitor Pass models."""
from django.db import models


class VisitorPass(models.Model):
    """Visitor request stored in Supabase PostgreSQL via Django ORM."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    full_name = models.CharField(max_length=150)
    mobile = models.CharField(max_length=15)
    email = models.EmailField()
    department = models.CharField(max_length=120)
    purpose = models.TextField()
    destination = models.CharField(max_length=200)
    visit_time = models.DateTimeField()
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    admin_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Visitor Pass"
        verbose_name_plural = "Visitor Passes"
        indexes = [
            models.Index(fields=["status", "-created_at"]),
            models.Index(fields=["email"]),
            models.Index(fields=["mobile"]),
        ]

    def __str__(self):
        return f"{self.full_name} → {self.destination} ({self.status})"