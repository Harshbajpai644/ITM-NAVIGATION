#!/usr/bin/env python
"""Seed sample ITM campus buildings."""
import os
import sys
from decimal import Decimal
from pathlib import Path

import django

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.buildings.models import Building  # noqa: E402

# Approximate coordinates around ITM Campus (Gwalior region)
BUILDINGS = [
    {
        "name": "Main Academic Block",
        "category": "academic",
        "description": "Primary classrooms and lecture halls.",
        "latitude": Decimal("26.1412000"),
        "longitude": Decimal("78.1995000"),
        "floor_count": 4,
    },
    {
        "name": "Administrative Building",
        "category": "administrative",
        "description": "Registrar, accounts, and principal office.",
        "latitude": Decimal("26.1405000"),
        "longitude": Decimal("78.1988000"),
        "floor_count": 3,
    },
    {
        "name": "Central Library",
        "category": "library",
        "description": "Books, journals, and digital resource center.",
        "latitude": Decimal("26.1418000"),
        "longitude": Decimal("78.2001000"),
        "floor_count": 3,
    },
    {
        "name": "Computer Science Lab",
        "category": "laboratory",
        "description": "CS & IT programming laboratories.",
        "latitude": Decimal("26.1415000"),
        "longitude": Decimal("78.1990000"),
        "floor_count": 2,
    },
    {
        "name": "Boys Hostel A",
        "category": "hostel",
        "description": "Residential hostel for male students.",
        "latitude": Decimal("26.1398000"),
        "longitude": Decimal("78.2005000"),
        "floor_count": 5,
    },
    {
        "name": "Girls Hostel B",
        "category": "hostel",
        "description": "Residential hostel for female students.",
        "latitude": Decimal("26.1395000"),
        "longitude": Decimal("78.1985000"),
        "floor_count": 5,
    },
    {
        "name": "Campus Cafeteria",
        "category": "cafeteria",
        "description": "Food court and student hangout.",
        "latitude": Decimal("26.1409000"),
        "longitude": Decimal("78.2008000"),
        "floor_count": 1,
    },
    {
        "name": "Sports Complex",
        "category": "sports",
        "description": "Indoor stadium, courts, and gymnasium.",
        "latitude": Decimal("26.1422000"),
        "longitude": Decimal("78.1982000"),
        "floor_count": 2,
    },
    {
        "name": "Main Gate",
        "category": "gate",
        "description": "Primary campus entrance and visitor desk.",
        "latitude": Decimal("26.1400000"),
        "longitude": Decimal("78.1975000"),
        "floor_count": 1,
    },
    {
        "name": "Visitor Parking",
        "category": "parking",
        "description": "Parking area near the main gate.",
        "latitude": Decimal("26.1397000"),
        "longitude": Decimal("78.1978000"),
        "floor_count": 1,
    },
]

created = 0
for data in BUILDINGS:
    obj, was_created = Building.objects.get_or_create(
        name=data["name"],
        defaults=data,
    )
    if was_created:
        created += 1
        print(f"  + {obj.name}")
    else:
        print(f"  · {obj.name} (exists)")

print(f"\nSeeded {created} new buildings. Total: {Building.objects.count()}")