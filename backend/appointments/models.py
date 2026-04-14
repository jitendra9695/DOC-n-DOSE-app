from django.db import models
from django.conf import settings
from doctors.models import DoctorProfile
from django.utils import timezone

class Appointment(models.Model):
    STATUS_CHOICES = [
        ('pending_payment', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    patient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(DoctorProfile, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()  # Slot start time (e.g. 12:00)
    slot_end_time = models.TimeField()     # Slot end time (e.g. 12:10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending_payment')
    symptoms = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        # Ek doctor ka ek hi slot ek patient ke liye
        unique_together = ['doctor', 'appointment_date', 'appointment_time']
    
    def __str__(self):
        return f"{self.patient.username} → Dr.{self.doctor.user.username} @ {self.appointment_date} {self.appointment_time}"