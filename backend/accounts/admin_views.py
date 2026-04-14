from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from appointments.models import Appointment
from pharmacy.models import MedicineOrder
from doctors.models import DoctorProfile

User = get_user_model()

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        
        return Response({
            'total_users': User.objects.count(),
            'total_doctors': DoctorProfile.objects.count(),
            'approved_doctors': DoctorProfile.objects.filter(is_approved=True).count(),
            'pending_doctors': DoctorProfile.objects.filter(is_approved=False).count(),
            'total_appointments': Appointment.objects.count(),
            'confirmed_appointments': Appointment.objects.filter(status='confirmed').count(),
            'total_orders': MedicineOrder.objects.count(),
        })

class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        users = User.objects.all().values('id', 'username', 'email', 'role', 'is_active', 'date_joined')
        return Response(list(users))
    
    def patch(self, request, user_id):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        try:
            user = User.objects.get(pk=user_id)
            user.is_active = request.data.get('is_active', user.is_active)
            user.save()
            return Response({'message': 'User updated'})
        except User.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)