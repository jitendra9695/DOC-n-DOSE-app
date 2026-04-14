from rest_framework import serializers
from .models import Appointment
from doctors.serializers import DoctorProfileSerializer
from accounts.serializers import UserSerializer
from datetime import datetime, timedelta

class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ['patient', 'status', 'slot_end_time']
    
    def get_patient_name(self, obj):
        return obj.patient.get_full_name() or obj.patient.username
    
    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.user.get_full_name()}"

class BookAppointmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor', 'appointment_date', 'appointment_time', 'symptoms']