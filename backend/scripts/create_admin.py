#!/usr/bin/env python
"""Create default admin user from environment variables."""
import os
import sys
from pathlib import Path

import django

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth.models import User  # noqa: E402
from dotenv import load_dotenv  # noqa: E402

load_dotenv(BASE_DIR / ".env")

username = os.getenv("ADMIN_USERNAME", "admin")
email = os.getenv("ADMIN_EMAIL", "admin@itm.edu")
password = os.getenv("ADMIN_PASSWORD", "Admin@12345")

user, created = User.objects.get_or_create(
    username=username,
    defaults={
        "email": email,
        "is_staff": True,
        "is_superuser": True,
    },
)
if created:
    user.set_password(password)
    user.save()
    print(f"Created admin user: {username}")
else:
    user.email = email
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    print(f"Updated admin user: {username}")