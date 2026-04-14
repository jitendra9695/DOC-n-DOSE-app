import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'docndose.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(role='admin').exists():
    admin = User.objects.create_superuser(
        username='admin',
        email='admin@docndose.com',
        password='admin123',
        role='admin'
    )
    print("✅ Admin created: admin / admin123")
else:
    print("⚠️ Admin already exists. Skipping.")