from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Medicine, MedicineOrder, OrderItem
from appointments.models import Appointment

class MedicineListView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        medicines = Medicine.objects.filter(is_available=True)
        data = [{
            'id': m.id,
            'name': m.name,
            'description': m.description,
            'price': str(m.price),
            'stock': m.stock,
            'unit': m.unit,
            'manufacturer': m.manufacturer
        } for m in medicines]
        return Response(data)

class PharmacyInventoryView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role not in ['admin']:
            return Response({'error': 'Access denied'}, status=403)
        medicines = Medicine.objects.all()
        data = [{
            'id': m.id,
            'name': m.name,
            'price': str(m.price),
            'stock': m.stock,
            'is_available': m.is_available,
            'manufacturer': m.manufacturer
        } for m in medicines]
        return Response(data)
    
    def post(self, request):
        if request.user.role not in ['admin']:
            return Response({'error': 'Access denied'}, status=403)
        
        medicine = Medicine.objects.create(
            name=request.data.get('name'),
            description=request.data.get('description', ''),
            price=request.data.get('price'),
            stock=request.data.get('stock', 0),
            unit=request.data.get('unit', 'tablet'),
            manufacturer=request.data.get('manufacturer', ''),
            added_by=request.user
        )
        return Response({'id': medicine.id, 'name': medicine.name, 'message': 'Medicine added'}, status=201)
    
    def patch(self, request, pk):
        if request.user.role not in ['admin']:
            return Response({'error': 'Access denied'}, status=403)
        try:
            medicine = Medicine.objects.get(pk=pk)
            medicine.stock = request.data.get('stock', medicine.stock)
            medicine.price = request.data.get('price', medicine.price)
            medicine.save()
            return Response({'message': 'Updated', 'stock': medicine.stock, 'is_available': medicine.is_available})
        except Medicine.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'patient':
            return Response({'error': 'Only patients can order'}, status=403)
        
        items = request.data.get('items', [])  # [{medicine_id, quantity}]
        delivery_address = request.data.get('delivery_address', '')
        appointment_id = request.data.get('appointment_id', None)
        
        if not items:
            return Response({'error': 'No items in order'}, status=400)
        
        appointment = None
        if appointment_id:
            try:
                appointment = Appointment.objects.get(pk=appointment_id, patient=request.user)
            except:
                pass
        
        order = MedicineOrder.objects.create(
            patient=request.user,
            appointment=appointment,
            delivery_address=delivery_address
        )
        
        total = 0
        for item in items:
            try:
                medicine = Medicine.objects.get(pk=item['medicine_id'])
                qty = item.get('quantity', 1)
                if medicine.stock < qty:
                    return Response({'error': f'{medicine.name} ka stock kam hai'}, status=400)
                
                OrderItem.objects.create(
                    order=order,
                    medicine=medicine,
                    quantity=qty,
                    price_at_order=medicine.price
                )
                medicine.stock -= qty
                medicine.save()
                total += medicine.price * qty
            except Medicine.DoesNotExist:
                pass
        
        order.total_amount = total
        order.save()
        
        return Response({
            'order_id': order.id,
            'total_amount': str(total),
            'status': order.status,
            'message': 'Order placed successfully!'
        }, status=201)

class OrderTrackView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.role == 'patient':
            orders = MedicineOrder.objects.filter(patient=request.user).order_by('-ordered_at')
        else:
            orders = MedicineOrder.objects.all().order_by('-ordered_at')
        
        data = []
        for o in orders:
            items = OrderItem.objects.filter(order=o)
            data.append({
                'order_id': o.id,
                'status': o.status,
                'total_amount': str(o.total_amount),
                'ordered_at': o.ordered_at,
                'delivery_address': o.delivery_address,
                'items': [{
                    'medicine': i.medicine.name,
                    'quantity': i.quantity,
                    'price': str(i.price_at_order)
                } for i in items]
            })
        return Response(data)
    
    def patch(self, request, order_id):
        if request.user.role not in ['admin']:
            return Response({'error': 'Access denied'}, status=403)
        try:
            order = MedicineOrder.objects.get(pk=order_id)
            order.status = request.data.get('status', order.status)
            order.save()
            return Response({'message': 'Order updated', 'status': order.status})
        except MedicineOrder.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)