from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 
                  'last_name', 'role', 'phone', 'address']
    
    def validate_role(self, value):
        if value == 'admin':
            raise serializers.ValidationError("Admin account cannot be created via registration.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 
                  'last_name', 'role', 'phone', 'address']

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()