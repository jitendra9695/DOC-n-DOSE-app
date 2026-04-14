from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatMessage
from appointments.models import Appointment

class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        # Verify access
        user = request.user
        is_patient = appointment.patient == user
        is_doctor = hasattr(user, 'doctor_profile') and appointment.doctor == user.doctor_profile
        
        if not (is_patient or is_doctor or user.role == 'admin'):
            return Response({'error': 'Access denied'}, status=403)
        
        messages = ChatMessage.objects.filter(appointment=appointment)
        data = [{
            'id': m.id,
            'sender': m.sender.username,
            'sender_role': m.sender.role,
            'message': m.message,
            'timestamp': m.timestamp,
            'is_read': m.is_read
        } for m in messages]
        
        return Response(data)
    
    def post(self, request, appointment_id):
        try:
            appointment = Appointment.objects.get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)
        
        if appointment.status != 'confirmed':
            return Response({'error': 'Chat is available only for confirmed appointments.'}, status=400)
        
        message_text = request.data.get('message', '').strip()
        if not message_text:
            return Response({'error': 'Message cannot be empty'}, status=400)
        
        msg = ChatMessage.objects.create(
            appointment=appointment,
            sender=request.user,
            message=message_text
        )
        
        return Response({
            'id': msg.id,
            'sender': msg.sender.username,
            'message': msg.message,
            'timestamp': msg.timestamp
        }, status=201)