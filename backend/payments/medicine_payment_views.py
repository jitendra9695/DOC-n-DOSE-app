import razorpay
import hmac
import hashlib
import uuid
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from pharmacy.models import Medicine, MedicineOrder, OrderItem

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class MedicineOrderCreateView(APIView):
    """
    Step 1 — Create a Razorpay order for medicine cart.
    Does NOT place the order yet — only creates a payment intent.
    Order is placed only after payment is verified.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'patient':
            return Response({'error': 'Only patients can order medicines.'}, status=403)

        items            = request.data.get('items', [])
        delivery_address = request.data.get('delivery_address', '').strip()
        amount_paise     = request.data.get('amount', 0)

        if not items:
            return Response({'error': 'Cart is empty.'}, status=400)
        if not delivery_address:
            return Response({'error': 'Delivery address is required.'}, status=400)
        if amount_paise <= 0:
            return Response({'error': 'Invalid amount.'}, status=400)

        # Validate stock availability before creating order
        for item in items:
            try:
                med = Medicine.objects.get(pk=item['medicine_id'])
                if med.stock < item.get('quantity', 1):
                    return Response(
                        {'error': f'{med.name} has only {med.stock} units in stock.'},
                        status=400
                    )
            except Medicine.DoesNotExist:
                return Response({'error': f"Medicine id {item['medicine_id']} not found."}, status=404)

        # Create Razorpay order
        razorpay_order = client.order.create({
            'amount':   int(amount_paise),
            'currency': 'INR',
            'receipt':  f"med_{request.user.id}_{uuid.uuid4().hex[:8]}",
            'notes': {
                'patient':  request.user.username,
                'type':     'medicine_order',
            },
        })

        return Response({
            'order_id': razorpay_order['id'],
            'amount':   int(amount_paise),
            'currency': 'INR',
            'key_id':   settings.RAZORPAY_KEY_ID,
        })


class MedicineOrderVerifyView(APIView):
    """
    Step 2 — Verify Razorpay signature.
    If valid → deduct stock → place the order in DB.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id   = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature  = request.data.get('razorpay_signature')
        items               = request.data.get('items', [])
        delivery_address    = request.data.get('delivery_address', '').strip()

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return Response({'error': 'Payment details missing.'}, status=400)

        # Verify HMAC-SHA256 signature
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        expected = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode('utf-8'),
            message.encode('utf-8'),
            hashlib.sha256,
        ).hexdigest()

        if expected != razorpay_signature:
            return Response({'error': 'Payment verification failed. Invalid signature.'}, status=400)

        # Payment is genuine — place the order
        order = MedicineOrder.objects.create(
            patient=request.user,
            delivery_address=delivery_address,
            status='placed',
        )

        total = 0
        for item in items:
            try:
                med = Medicine.objects.get(pk=item['medicine_id'])
                qty = item.get('quantity', 1)

                # Deduct stock
                if med.stock < qty:
                    # Edge case: stock changed between order creation and payment
                    order.delete()
                    return Response({'error': f'{med.name} is now out of stock.'}, status=400)

                OrderItem.objects.create(
                    order=order,
                    medicine=med,
                    quantity=qty,
                    price_at_order=med.price,
                )
                med.stock -= qty
                med.save()
                total += med.price * qty

            except Medicine.DoesNotExist:
                pass

        order.total_amount = total
        order.save()

        return Response({
            'message':  'Order placed successfully!',
            'order_id': order.id,
            'total':    str(total),
            'status':   order.status,
        })
