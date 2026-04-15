"""
Runs on every Railway deployment.
Creates the default admin only if no admin exists yet.
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docndose.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(role='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@docndose.com',
        password='admin123',
        role='admin',
    )
    print("✅ Default admin created  →  admin / admin123")
else:
    print("ℹ️  Admin already exists. Skipped.")
