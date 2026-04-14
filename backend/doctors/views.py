from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import DoctorProfile
from .serializers import DoctorProfileSerializer, DoctorCreateSerializer
from django.contrib.auth import get_user_model

from django.db import models as db_models



User = get_user_model()

class DoctorListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        specialization = request.query_params.get('specialization', None)
        doctors = DoctorProfile.objects.filter(is_approved=True)
        if specialization:
            doctors = doctors.filter(specialization=specialization)
        serializer = DoctorProfileSerializer(doctors, many=True)
        return Response(serializer.data)

class DoctorDetailView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, pk):
        try:
            doctor = DoctorProfile.objects.get(pk=pk, is_approved=True)
            serializer = DoctorProfileSerializer(doctor)
            return Response(serializer.data)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found'}, status=status.HTTP_404_NOT_FOUND)

class MyDoctorProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Not a doctor'}, status=403)
        try:
            profile = request.user.doctor_profile
            return Response(DoctorProfileSerializer(profile).data)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)
    
    def post(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Not a doctor'}, status=403)
        if DoctorProfile.objects.filter(user=request.user).exists():
            return Response({'error': 'Profile already exists'}, status=400)
        serializer = DoctorCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    
    def put(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Not a doctor'}, status=403)
        try:
            profile = request.user.doctor_profile
            serializer = DoctorCreateSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(DoctorProfileSerializer(profile).data)
            return Response(serializer.errors, status=400)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Profile not found'}, status=404)

class AdminDoctorManageView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        doctors = DoctorProfile.objects.all()
        return Response(DoctorProfileSerializer(doctors, many=True).data)
    
    def patch(self, request, pk):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        try:
            doctor = DoctorProfile.objects.get(pk=pk)
            doctor.is_approved = request.data.get('is_approved', doctor.is_approved)
            doctor.save()
            return Response({'message': 'Updated', 'is_approved': doctor.is_approved})
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        

class DoctorAvailabilityToggleView(APIView):
    """
    Doctor can mark themselves as unavailable for today.

    PATCH /api/doctors/my-profile/availability/
    Body: { "available_today": false }

    When available_today = false:
      - is_available_today flag is set to False on DoctorProfile
      - All pending_payment appointments for today are left as-is
        (patient cannot book new slots because slot check also checks this flag)

    GET /api/doctors/my-profile/availability/
      - Returns current availability status
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Doctor only.'}, status=403)
        try:
            profile = request.user.doctor_profile
            return Response({
                'available_today': profile.is_available_today,
                'work_start_time': str(profile.work_start_time),
                'work_end_time':   str(profile.work_end_time),
            })
        except Exception:
            return Response({'error': 'Profile not found.'}, status=404)

    def patch(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Doctor only.'}, status=403)
        try:
            profile = request.user.doctor_profile
            available = request.data.get('available_today', True)
            profile.is_available_today = bool(available)
            profile.save()
            return Response({
                'message': 'Availability updated.',
                'available_today': profile.is_available_today,
            })
        except Exception:
            return Response({'error': 'Profile not found.'}, status=404)
