from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator, EmailValidator, MinLengthValidator, MaxLengthValidator
from django.core.exceptions import ValidationError

class User(AbstractUser):
    # ---------- OVERRIDE EMAIL FIELD FOR VALIDATION ----------
    email = models.EmailField(
        unique=True,                     # email unique hona chahiye
        blank=False,                     # empty nahi ho sakta
        validators=[EmailValidator(message="Enter a valid email address with @ and domain (e.g., name@example.com)")]
    )

    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('patient', 'Patient'),
        ('doctor', 'Doctor'),
        ('pharmacy', 'Pharmacy'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='patient')

    # Phone: exactly 10 digits, only numbers
    phone = models.CharField(
        max_length=10,
        blank=True,
        validators=[
            RegexValidator(
                regex=r'^\d{10}$',
                message="Phone number must be exactly 10 digits (0-9 only)."
            )
        ]
    )

    # Address: optional, but can set a max length (optional validation)
    address = models.TextField(
        blank=True,
        validators=[
            MaxLengthValidator(500, message="Address cannot exceed 500 characters.")
        ]
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

    # ---------- MODEL-LEVEL CLEAN METHOD FOR EXTRA VALIDATION ----------
    def clean(self):
        super().clean()
        # Extra check: email should not be empty (though blank=False already ensures)
        if not self.email:
            raise ValidationError({'email': 'Email field is required.'})

        # Phone validation: if phone is provided, check digits (RegexValidator already does, but we add extra)
        if self.phone and not self.phone.isdigit():
            raise ValidationError({'phone': 'Phone number must contain only digits.'})

        # Role validation (choices already handle, but safe)
        valid_roles = [choice[0] for choice in self.ROLE_CHOICES]
        if self.role not in valid_roles:
            raise ValidationError({'role': f'Invalid role. Choose from {valid_roles}'})

    # Override save to call full_clean() automatically
    def save(self, *args, **kwargs):
        self.full_clean()   # calls clean() and field validators before saving
        super().save(*args, **kwargs)