from django.db import models
from django.conf import settings
from appointments.models import Appointment


class Prescription(models.Model):
    """
    Stores the doctor's diagnosis and prescription for a completed appointment.
    Both the doctor and the patient can read this record at any time.
    The appointment record itself is never deleted.
    """
    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.CASCADE,
        related_name='prescription',
    )
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prescriptions_written',
    )
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='prescriptions_received',
    )

    # Clinical details
    diagnosis        = models.TextField()
    chief_complaint  = models.TextField(blank=True)   # patient's main symptom
    clinical_notes   = models.TextField(blank=True)   # doctor's examination notes
    medicines        = models.TextField()              # prescribed medicines + dosage
    follow_up_days   = models.PositiveIntegerField(default=0)   # 0 = no follow-up needed
    follow_up_notes  = models.TextField(blank=True)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Rx — Apt#{self.appointment_id} — {self.diagnosis[:40]}"
