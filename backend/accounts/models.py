from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('pharmacy', 'Pharmacy'),          # Added pharmacy role
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class AdminNotification(models.Model):
    TYPE_CHOICES = [
        ('info', 'Information'),
        ('suggestion', 'Suggestion'),
        ('warning', 'Warning'),
        ('achievement', 'Achievement'),
    ]
    sender = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='sent_notifications')
    recipient_doctor = models.ForeignKey(
        'doctors.DoctorProfile', on_delete=models.CASCADE,
        null=True, blank=True, related_name='notifications')
    message = models.TextField()
    notif_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default='info')
    is_broadcast = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_notif_type_display()} - {self.message[:50]}"