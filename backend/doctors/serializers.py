from rest_framework import serializers
from .models import DoctorProfile
from accounts.serializers import UserSerializer

class DoctorProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = DoctorProfile
        fields = '__all__'
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username

class DoctorCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        exclude = ['user', 'is_approved']