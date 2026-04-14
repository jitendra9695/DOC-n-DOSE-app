from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime, timedelta, date

from .models import Appointment
from doctors.models import DoctorProfile

# Import Prescription model (lives in its own app or in appointments)
try:
    from .prescription_model import Prescription
except ImportError:
    from prescriptions.models import Prescription


# ─────────────────────────────────────────────────────────────────────────────
# Serializer helpers  (no DRF serializers needed — plain dicts are cleaner here)
# ─────────────────────────────────────────────────────────────────────────────

def serialize_appointment(apt, include_prescription=False):
    data = {
        'id':               apt.id,
        'patient_id':       apt.patient_id,
        'patient_name':     apt.patient.get_full_name() or apt.patient.username,
        'patient_username': apt.patient.username,
        'doctor_id':        apt.doctor_id,
        'doctor_name':      f"Dr. {apt.doctor.user.get_full_name()}",
        'specialization':   apt.doctor.specialization,
        'appointment_date': str(apt.appointment_date),
        'appointment_time': str(apt.appointment_time),
        'slot_end_time':    str(apt.slot_end_time),
        'status':           apt.status,
        'symptoms':         apt.symptoms,
        'created_at':       apt.created_at.isoformat(),
    }
    if include_prescription:
        try:
            rx = apt.prescription
            data['prescription'] = {
                'id':              rx.id,
                'diagnosis':       rx.diagnosis,
                'chief_complaint': rx.chief_complaint,
                'clinical_notes':  rx.clinical_notes,
                'medicines':       rx.medicines,
                'follow_up_days':  rx.follow_up_days,
                'follow_up_notes': rx.follow_up_notes,
                'written_at':      rx.created_at.isoformat(),
            }
        except Exception:
            data['prescription'] = None
    return data


# ─────────────────────────────────────────────────────────────────────────────
# 1. Available Slots
# ─────────────────────────────────────────────────────────────────────────────

class AvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, doctor_id):
        today = date.today()

        try:
            doctor = DoctorProfile.objects.get(pk=doctor_id, is_approved=True)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found.'}, status=404)
        
        if not doctor.is_available_today:
            return Response({
                'error': 'Doctor has marked themselves as unavailable today.',
                'slots': [],
                'doctor_unavailable': True,
            }, status=200)

        booking_date_str = request.query_params.get('date', str(today))
        try:
            booking_date = datetime.strptime(booking_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=400)

        if booking_date != today:
            return Response({'error': 'Only today\'s appointments can be booked.'}, status=400)

        start   = datetime.combine(booking_date, doctor.work_start_time)
        end     = datetime.combine(booking_date, doctor.work_end_time)
        slots   = []
        current = start

        while current + timedelta(minutes=10) <= end:
            slot_time = current.time()
            slot_end  = (current + timedelta(minutes=10)).time()

            is_booked = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=booking_date,
                appointment_time=slot_time,
                status__in=['confirmed', 'pending_payment'],
            ).exists()

            slots.append({
                'time':         slot_time.strftime('%H:%M'),
                'end_time':     slot_end.strftime('%H:%M'),
                'is_available': not is_booked,
            })
            current += timedelta(minutes=10)

        return Response({
            'doctor_id':   doctor_id,
            'doctor_name': f"Dr. {doctor.user.get_full_name()}",
            'date':        str(booking_date),
            'slots':       slots,
        })


# ─────────────────────────────────────────────────────────────────────────────
# 2. Book Appointment
# ─────────────────────────────────────────────────────────────────────────────

class BookAppointmentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'patient':
            return Response({'error': 'Only patients can book appointments.'}, status=403)

        today = date.today()
        date_str = request.data.get('appointment_date')
        try:
            appointment_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return Response({'error': 'Invalid date format.'}, status=400)

        if appointment_date != today:
            return Response({'error': 'Only today\'s date can be booked.'}, status=400)

        doctor_id = request.data.get('doctor')
        time_str  = request.data.get('appointment_time')

        try:
            doctor = DoctorProfile.objects.get(pk=doctor_id, is_approved=True)
        except DoctorProfile.DoesNotExist:
            return Response({'error': 'Doctor not found.'}, status=404)

        try:
            slot_time = datetime.strptime(time_str, '%H:%M').time()
        except (ValueError, TypeError):
            return Response({'error': 'Invalid time format. Use HH:MM.'}, status=400)

        if not (doctor.work_start_time <= slot_time < doctor.work_end_time):
            return Response({'error': 'Slot is outside doctor working hours.'}, status=400)

        if Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=slot_time,
            status__in=['confirmed', 'pending_payment'],
        ).exists():
            return Response({'error': 'This slot is already booked.'}, status=400)

        slot_end = (datetime.combine(appointment_date, slot_time) + timedelta(minutes=10)).time()

        apt = Appointment.objects.create(
            patient=request.user,
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=slot_time,
            slot_end_time=slot_end,
            symptoms=request.data.get('symptoms', ''),
            status='pending_payment',
        )
        return Response(serialize_appointment(apt), status=201)


# ─────────────────────────────────────────────────────────────────────────────
# 3. My Appointments
#    Patient → sees all their appointments (all statuses, all time)
#    Doctor  → sees all appointments assigned to them (all statuses, all time)
#    Admin   → sees everything
# ─────────────────────────────────────────────────────────────────────────────

class MyAppointmentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'patient':
            apts = Appointment.objects.filter(
                patient=user
            ).select_related('doctor__user', 'patient').order_by('-appointment_date', '-appointment_time')

        elif user.role == 'doctor':
            try:
                doctor = user.doctor_profile
            except DoctorProfile.DoesNotExist:
                return Response({'error': 'Doctor profile not found.'}, status=404)
            apts = Appointment.objects.filter(
                doctor=doctor
            ).select_related('doctor__user', 'patient').order_by('-appointment_date', '-appointment_time')

        else:  # admin
            apts = Appointment.objects.all().select_related(
                'doctor__user', 'patient'
            ).order_by('-appointment_date', '-appointment_time')

        # Include prescription data for completed appointments
        return Response([
            serialize_appointment(apt, include_prescription=(apt.status == 'completed'))
            for apt in apts
        ])


# ─────────────────────────────────────────────────────────────────────────────
# 4. Appointment Detail
# ─────────────────────────────────────────────────────────────────────────────

class AppointmentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            apt = Appointment.objects.select_related('doctor__user', 'patient').get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=404)

        # Access check
        user = request.user
        is_patient = apt.patient == user
        is_doctor  = user.role == 'doctor' and hasattr(user, 'doctor_profile') and apt.doctor == user.doctor_profile
        is_admin   = user.role == 'admin'

        if not (is_patient or is_doctor or is_admin):
            return Response({'error': 'Access denied.'}, status=403)

        return Response(serialize_appointment(apt, include_prescription=True))


# ─────────────────────────────────────────────────────────────────────────────
# 5. Write / Update Diagnosis + Prescription  (Doctor only)
# ─────────────────────────────────────────────────────────────────────────────

class WritePrescriptionView(APIView):
    """
    Doctor writes/updates diagnosis and prescription for an appointment.
    - Appointment status changes to 'completed'.
    - A Prescription record is created / updated — visible to BOTH doctor and patient forever.
    - The appointment record is NEVER deleted.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):
        if request.user.role != 'doctor':
            return Response({'error': 'Only doctors can write prescriptions.'}, status=403)

        try:
            apt = Appointment.objects.select_related('doctor__user', 'patient').get(
                pk=appointment_id,
                doctor=request.user.doctor_profile,
            )
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found or not assigned to you.'}, status=404)

        if apt.status not in ['confirmed', 'completed']:
            return Response({'error': 'Prescription can only be written for confirmed appointments.'}, status=400)

        diagnosis       = request.data.get('diagnosis', '').strip()
        medicines       = request.data.get('medicines', '').strip()
        chief_complaint = request.data.get('chief_complaint', apt.symptoms).strip()
        clinical_notes  = request.data.get('clinical_notes', '').strip()
        follow_up_days  = int(request.data.get('follow_up_days', 0))
        follow_up_notes = request.data.get('follow_up_notes', '').strip()

        if not diagnosis:
            return Response({'error': 'Diagnosis cannot be empty.'}, status=400)
        if not medicines:
            return Response({'error': 'Medicines / prescription cannot be empty.'}, status=400)

        # Create or update prescription
        prescription, _ = Prescription.objects.update_or_create(
            appointment=apt,
            defaults={
                'doctor':          request.user,
                'patient':         apt.patient,
                'diagnosis':       diagnosis,
                'chief_complaint': chief_complaint,
                'clinical_notes':  clinical_notes,
                'medicines':       medicines,
                'follow_up_days':  follow_up_days,
                'follow_up_notes': follow_up_notes,
            },
        )

        # Mark appointment complete
        apt.status = 'completed'
        apt.save()

        return Response({
            'message': 'Prescription saved successfully.',
            'appointment': serialize_appointment(apt, include_prescription=True),
        })

    def get(self, request, appointment_id):
        """Fetch prescription for a specific appointment."""
        user = request.user
        try:
            apt = Appointment.objects.select_related('doctor__user', 'patient').get(pk=appointment_id)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=404)

        is_patient = apt.patient == user
        is_doctor  = user.role == 'doctor' and hasattr(user, 'doctor_profile') and apt.doctor == user.doctor_profile
        is_admin   = user.role == 'admin'

        if not (is_patient or is_doctor or is_admin):
            return Response({'error': 'Access denied.'}, status=403)

        return Response(serialize_appointment(apt, include_prescription=True))


# ─────────────────────────────────────────────────────────────────────────────
# 6. Doctor's full history (past completed + upcoming confirmed)
# ─────────────────────────────────────────────────────────────────────────────

class DoctorHistoryView(APIView):
    """
    Doctor gets full history split into:
    - upcoming  : confirmed appointments
    - completed : finished appointments with prescriptions
    - pending   : pending_payment slots
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Doctor only.'}, status=403)

        try:
            doctor = request.user.doctor_profile
        except Exception:
            return Response({'error': 'Doctor profile not found.'}, status=404)

        all_apts = Appointment.objects.filter(
            doctor=doctor
        ).select_related('doctor__user', 'patient').order_by('-appointment_date', '-appointment_time')

        upcoming  = [serialize_appointment(a) for a in all_apts if a.status == 'confirmed']
        completed = [serialize_appointment(a, include_prescription=True) for a in all_apts if a.status == 'completed']
        pending   = [serialize_appointment(a) for a in all_apts if a.status == 'pending_payment']
        cancelled = [serialize_appointment(a) for a in all_apts if a.status == 'cancelled']

        return Response({
            'upcoming':  upcoming,
            'completed': completed,
            'pending':   pending,
            'cancelled': cancelled,
            'total':     all_apts.count(),
        })


# ─────────────────────────────────────────────────────────────────────────────
# 7. Patient's full history
# ─────────────────────────────────────────────────────────────────────────────

class PatientHistoryView(APIView):
    """
    Patient gets their full appointment history including prescriptions
    for completed appointments.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'patient':
            return Response({'error': 'Patient only.'}, status=403)

        all_apts = Appointment.objects.filter(
            patient=request.user
        ).select_related('doctor__user', 'patient').order_by('-appointment_date', '-appointment_time')

        upcoming  = [serialize_appointment(a) for a in all_apts if a.status == 'confirmed']
        completed = [serialize_appointment(a, include_prescription=True) for a in all_apts if a.status == 'completed']
        pending   = [serialize_appointment(a) for a in all_apts if a.status == 'pending_payment']

        return Response({
            'upcoming':  upcoming,
            'completed': completed,
            'pending':   pending,
            'total':     all_apts.count(),
        })

# ─────────────────────────────────────────────────────────────────────────────
# ADD THIS CLASS to your existing backend/appointments/views.py
# Just paste it at the bottom of the file
# ─────────────────────────────────────────────────────────────────────────────


class DeleteAppointmentView(APIView):
    """
    DELETE /api/appointments/<pk>/delete/

    Rules:
    - Patient can delete their OWN appointment only if:
        * status is 'cancelled' OR
        * status is 'completed' OR
        * appointment_date is in the past (already over)
        * status is 'pending_payment' (payment never done)

    - Doctor can delete their OWN completed appointments from history.

    - Admin can delete anything.

    We NEVER delete confirmed future appointments — that would be irresponsible.
    """
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        user = request.user
        today = date.today()

        try:
            apt = Appointment.objects.get(pk=pk)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found.'}, status=404)

        # ── Permission check ──────────────────────────────────────────────────
        is_patient = apt.patient == user
        is_doctor  = (user.role == 'doctor' and
                      hasattr(user, 'doctor_profile') and
                      apt.doctor == user.doctor_profile)
        is_admin   = user.role == 'admin'

        if not (is_patient or is_doctor or is_admin):
            return Response({'error': 'You do not have permission to delete this appointment.'}, status=403)

        # ── Safety: block deletion of active future appointments ──────────────
        if (apt.status == 'confirmed' and
                apt.appointment_date >= today and
                not is_admin):
            return Response({
                'error': (
                    'Active upcoming appointments cannot be deleted. '
                    'Please cancel the appointment first or wait until it is over.'
                )
            }, status=400)

        # ── Allow deletion ────────────────────────────────────────────────────
        apt_info = f"Appointment #{apt.id} ({apt.appointment_date})"
        apt.delete()

        return Response({'message': f'{apt_info} deleted successfully.'})
