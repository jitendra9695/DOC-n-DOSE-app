import razorpay
import hmac
import hashlib
import uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from appointments.models import Appointment

# Initialize Razorpay client using keys from settings
client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreateOrderView(APIView):
    """
    Step 1 of payment flow.
    Patient requests an order — Razorpay gives back an order_id.
    Frontend uses this order_id to open the Razorpay checkout popup.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        appointment_id = request.data.get("appointment_id")

        if not appointment_id:
            return Response(
                {"error": "appointment_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Fetch appointment and validate ownership
        try:
            appointment = Appointment.objects.get(
                pk=appointment_id, patient=request.user
            )
        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if appointment.status != "pending_payment":
            return Response(
                {"error": "This appointment has already been processed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if a payment record already exists for this appointment
        if Payment.objects.filter(
            appointment=appointment, status="success"
        ).exists():
            return Response(
                {"error": "Payment already completed for this appointment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Amount in paise (Razorpay always works in smallest currency unit)
        # ₹500 = 50000 paise
        amount_inr = float(appointment.doctor.consultation_fee)
        amount_paise = int(amount_inr * 100)

        # Create Razorpay order
        razorpay_order = client.order.create({
            "amount":   amount_paise,
            "currency": "INR",
            "receipt":  f"apt_{appointment_id}_{uuid.uuid4().hex[:8]}",
            "notes": {
                "appointment_id": str(appointment_id),
                "patient":        request.user.username,
                "doctor":         appointment.doctor.user.username,
            },
        })

        # Save a pending payment record in our database
        Payment.objects.update_or_create(
            appointment=appointment,
            defaults={
                "patient":        request.user,
                "amount":         amount_inr,
                "status":         "pending",
                "transaction_id": razorpay_order["id"],
            },
        )

        return Response({
            "order_id":    razorpay_order["id"],
            "amount":      amount_paise,
            "currency":    "INR",
            "key_id":      settings.RAZORPAY_KEY_ID,
            "appointment_id": appointment_id,
            "doctor_name": appointment.doctor.user.get_full_name(),
            "patient_name": request.user.get_full_name() or request.user.username,
            "description": f"Consultation with Dr. {appointment.doctor.user.get_full_name()}",
        })


class VerifyPaymentView(APIView):
    """
    Step 2 of payment flow.
    After Razorpay popup closes successfully, frontend sends the payment
    details here.  We verify the signature — if valid, appointment confirmed.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id   = request.data.get("razorpay_order_id")
        razorpay_payment_id = request.data.get("razorpay_payment_id")
        razorpay_signature  = request.data.get("razorpay_signature")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response(
                {"error": "razorpay_order_id, razorpay_payment_id and razorpay_signature are all required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Signature verification ────────────────────────────────────────────
        # Razorpay creates a signature = HMAC-SHA256(order_id + "|" + payment_id, secret)
        # We recreate it and compare — if they match, payment is genuine.
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if expected_signature != razorpay_signature:
            # Signature mismatch — someone tampered with the data
            try:
                payment = Payment.objects.get(transaction_id=razorpay_order_id)
                payment.status = "failed"
                payment.save()
            except Payment.DoesNotExist:
                pass
            return Response(
                {"error": "Payment verification failed. Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # ── Signature valid — confirm payment and appointment ─────────────────
        try:
            payment = Payment.objects.get(transaction_id=razorpay_order_id)
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment record not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        payment.status         = "success"
        payment.transaction_id = razorpay_payment_id   # store actual payment id
        payment.save()

        appointment         = payment.appointment
        appointment.status  = "confirmed"
        appointment.save()

        return Response({
            "message":        "Payment successful! Appointment confirmed.",
            "payment_id":     razorpay_payment_id,
            "appointment_id": appointment.id,
            "status":         "confirmed",
        })


class PaymentFailedView(APIView):
    """
    Called when user closes Razorpay popup without paying,
    or payment fails.  We mark the payment as failed.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        order_id = request.data.get("order_id")

        if not order_id:
            return Response({"error": "order_id required."}, status=400)

        try:
            payment = Payment.objects.get(
                transaction_id=order_id, patient=request.user
            )
            payment.status = "failed"
            payment.save()
            return Response({"message": "Payment marked as failed."})
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=404)


class PaymentHistoryView(APIView):
    """Returns all past payments for the logged-in patient."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = Payment.objects.filter(
            patient=request.user
        ).order_by("-created_at")

        data = [
            {
                "id":             p.id,
                "transaction_id": p.transaction_id,
                "amount":         str(p.amount),
                "status":         p.status,
                "appointment_id": p.appointment.id,
                "doctor":         p.appointment.doctor.user.get_full_name(),
                "date":           p.appointment.appointment_date,
                "paid_at":        p.paid_at,
            }
            for p in payments
        ]
        return Response(data)