from django.db import models
from django.conf import settings

class DoctorProfile(models.Model):
    SPECIALIZATION_CHOICES = [
        ('general', 'General Physician'),
        ('cardiologist', 'Cardiologist'),
        ('dermatologist', 'Dermatologist'),
        ('neurologist', 'Neurologist'),
        ('orthopedic', 'Orthopedic'),
        ('pediatrician', 'Pediatrician'),
        ('psychiatrist', 'Psychiatrist'),
        ('gynecologist', 'Gynecologist'),
        ('ent', 'ENT Specialist'),
        ('ophthalmologist', 'Ophthalmologist'),
        ('dentist', 'Dentist'),
        ('urologist', 'Urologist'),
        
    ]
    
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    experience_years = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    bio = models.TextField(blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    # Working hours (doctor ka fixed time)
    work_start_time = models.TimeField(default='09:00')
    work_end_time = models.TimeField(default='17:00')

    is_available_today = models.BooleanField(default=True)
    
    is_approved = models.BooleanField(default=False)
    profile_image = models.ImageField(upload_to='doctors/', blank=True, null=True)
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.specialization}"