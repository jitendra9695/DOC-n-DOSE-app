"""
DocNDoSe — Payments Views (Fake Gateway Compatible)
Replace backend/payments/views.py with this file.

Works with BOTH:
- Real Razorpay (if keys are set)
- Fake payment gateway (if keys are missing/fake)
"""

import hmac, hashlib, razorpay
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from appointments.models import Appointment
from .models import Payment


def get_razorpay_client():
    key_id     = getattr(settings, 'RAZORPAY_KEY_ID',     '')
    key_secret = getattr(settings, 'RAZORPAY_KEY_SECRET', '')
    if key_id and key_secret and key_id.startswith('rzp_'):
        return razorpay.Client(auth=(key_id, key_secret)), True
    return None, False


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get('appointment_id')
        try:
            apt = Appointment.objects.get(id=appointment_id, patient=request.user)
        except Appointment.DoesNotExist:
            return Response({'error': 'Appointment not found'}, status=404)

        amount_paise = int(float(apt.doctor.consultation_fee) * 100)
        client, real_razorpay = get_razorpay_client()

        if real_razorpay:
            # Real Razorpay
            try:
                order = client.order.create({
                    'amount':   amount_paise,
                    'currency': 'INR',
                    'receipt':  f'apt_{appointment_id}',
                })
                Payment.objects.create(
                    patient=request.user, appointment=apt,
                    amount=apt.doctor.consultation_fee,
                    razorpay_order_id=order['id'], status='pending',
                )
                return Response({
                    'order_id': order['id'], 'amount': amount_paise,
                    'currency': 'INR', 'key_id': settings.RAZORPAY_KEY_ID,
                })
            except Exception as e:
                return Response({'error': str(e)}, status=500)
        else:
            # Fake gateway — generate fake order ID
            import uuid
            fake_order_id = f"order_fake_{uuid.uuid4().hex[:16].upper()}"
            Payment.objects.create(
                patient=request.user, appointment=apt,
                amount=apt.doctor.consultation_fee,
                razorpay_order_id=fake_order_id, status='pending',
            )
            return Response({
                'order_id': fake_order_id,
                'amount':   amount_paise,
                'currency': 'INR',
                'key_id':   'rzp_test_fake',
                'fake':     True,
            })


class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        payment_id = request.data.get('razorpay_payment_id', '')
        order_id   = request.data.get('razorpay_order_id',   '')
        signature  = request.data.get('razorpay_signature',  '')
        apt_id     = request.data.get('appointment_id')

        # ── Fake payment detection ────────────────────────────────────────────
        is_fake = (
            'fake' in payment_id.lower() or
            'fake' in order_id.lower() or
            'fake' in signature.lower() or
            not getattr(settings, 'RAZORPAY_KEY_SECRET', '')
        )

        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
        except Payment.DoesNotExist:
            # Create payment record if missing (edge case)
            try:
                apt = Appointment.objects.get(id=apt_id, patient=request.user)
                payment = Payment.objects.create(
                    patient=request.user, appointment=apt,
                    amount=apt.doctor.consultation_fee,
                    razorpay_order_id=order_id, status='pending',
                )
            except Exception:
                return Response({'error': 'Payment record not found'}, status=404)

        if is_fake:
            # Accept fake payment directly
            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature  = signature
            payment.status = 'success'
            payment.save()
            payment.appointment.status = 'confirmed'
            payment.appointment.save()
            return Response({'status': 'success', 'message': 'Payment verified (test mode)'})

        # ── Real Razorpay verification ────────────────────────────────────────
        try:
            key_secret = settings.RAZORPAY_KEY_SECRET.encode()
            msg = f"{order_id}|{payment_id}".encode()
            expected = hmac.new(key_secret, msg, hashlib.sha256).hexdigest()
            if not hmac.compare_digest(expected, signature):
                payment.status = 'failed'
                payment.save()
                return Response({'error': 'Invalid signature'}, status=400)

            payment.razorpay_payment_id = payment_id
            payment.razorpay_signature  = signature
            payment.status = 'success'
            payment.save()
            payment.appointment.status = 'confirmed'
            payment.appointment.save()
            return Response({'status': 'success'})

        except Exception as e:
            return Response({'error': str(e)}, status=500)


class PaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(patient=request.user).select_related('appointment__doctor__user').order_by('-created_at')
        data = []
        for p in payments:
            data.append({
                'id':           p.id,
                'amount':       float(p.amount),
                'status':       p.status,
                'payment_id':   p.razorpay_payment_id,
                'order_id':     p.razorpay_order_id,
                'created_at':   p.created_at.strftime('%Y-%m-%d %H:%M'),
                'paid_at':      p.paid_at.strftime('%Y-%m-%d %H:%M') if p.paid_at else None,
                'doctor':       p.appointment.doctor.user.get_full_name() if p.appointment else None,
                'specialization': p.appointment.doctor.specialization if p.appointment else None,
            })
        return Response(data)


class PaymentFailedView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get('razorpay_order_id')
        try:
            payment = Payment.objects.get(razorpay_order_id=order_id)
            payment.status = 'failed'
            payment.save()
        except Payment.DoesNotExist:
            pass
        return Response({'status': 'noted'})
