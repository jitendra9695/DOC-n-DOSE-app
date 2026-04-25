from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q
from datetime import timedelta, date
from appointments.models import Appointment
from pharmacy.models import MedicineOrder, Medicine, OrderItem
from doctors.models import DoctorProfile
from payments.models import Payment

User = get_user_model()


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        today = date.today()
        last_7 = today - timedelta(days=7)
        last_30 = today - timedelta(days=30)

        total_revenue = Payment.objects.filter(status='success').aggregate(
            total=Sum('amount'))['total'] or 0
        revenue_7d = Payment.objects.filter(
            status='success', paid_at__date__gte=last_7).aggregate(
            total=Sum('amount'))['total'] or 0
        revenue_30d = Payment.objects.filter(
            status='success', paid_at__date__gte=last_30).aggregate(
            total=Sum('amount'))['total'] or 0

        return Response({
            'total_users': User.objects.count(),
            'new_users_7d': User.objects.filter(date_joined__date__gte=last_7).count(),
            'total_doctors': DoctorProfile.objects.count(),
            'approved_doctors': DoctorProfile.objects.filter(is_approved=True).count(),
            'pending_doctors': DoctorProfile.objects.filter(is_approved=False).count(),
            'total_appointments': Appointment.objects.count(),
            'confirmed_appointments': Appointment.objects.filter(status='confirmed').count(),
            'completed_appointments': Appointment.objects.filter(status='completed').count(),
            'today_appointments': Appointment.objects.filter(appointment_date=today).count(),
            'total_orders': MedicineOrder.objects.count(),
            'total_revenue': float(total_revenue),
            'revenue_7d': float(revenue_7d),
            'revenue_30d': float(revenue_30d),
            'medicine_revenue': float(
                MedicineOrder.objects.filter(
                    status__in=['delivered', 'shipped', 'processing']
                ).aggregate(total=Sum('total_amount'))['total'] or 0
            ),
        })


class AdminUsersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        users = User.objects.all().values(
            'id', 'username', 'email', 'role', 'is_active', 'date_joined')
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


class AdminRevenueAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)
        today = date.today()

        # Last 30 days daily revenue
        daily_revenue = []
        for i in range(29, -1, -1):
            d = today - timedelta(days=i)
            amt = Payment.objects.filter(
                status='success', paid_at__date=d
            ).aggregate(total=Sum('amount'))['total'] or 0
            orders = MedicineOrder.objects.filter(
                ordered_at__date=d,
                status__in=['delivered', 'shipped', 'processing']
            ).aggregate(total=Sum('total_amount'))['total'] or 0
            daily_revenue.append({
                'date': str(d),
                'label': d.strftime('%d %b'),
                'consultation_revenue': float(amt),
                'medicine_revenue': float(orders),
                'total': float(amt) + float(orders),
            })

        # Payment method breakdown (simulated from transaction_id prefix)
        total_payments = Payment.objects.filter(status='success').count()
        failed_payments = Payment.objects.filter(status='failed').count()
        pending_payments = Payment.objects.filter(status='pending').count()

        # Top earning doctors
        top_doctors = []
        for dp in DoctorProfile.objects.filter(is_approved=True):
            earned = Payment.objects.filter(
                appointment__doctor=dp, status='success'
            ).aggregate(total=Sum('amount'))['total'] or 0
            apt_count = Appointment.objects.filter(
                doctor=dp, status__in=['confirmed', 'completed']
            ).count()
            top_doctors.append({
                'name': f"Dr. {dp.user.get_full_name()}",
                'specialization': dp.specialization,
                'fee': float(dp.consultation_fee),
                'total_earned': float(earned),
                'appointments': apt_count,
                'doctor_id': dp.id,
            })
        top_doctors.sort(key=lambda x: x['total_earned'], reverse=True)

        return Response({
            'daily_revenue': daily_revenue,
            'payment_stats': {
                'successful': total_payments,
                'failed': failed_payments,
                'pending': pending_payments,
            },
            'top_earning_doctors': top_doctors[:10],
        })


class AdminDoctorAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)

        doctors_data = []
        for dp in DoctorProfile.objects.select_related('user').all():
            total_apts = Appointment.objects.filter(doctor=dp).count()
            confirmed = Appointment.objects.filter(
                doctor=dp, status='confirmed').count()
            completed = Appointment.objects.filter(
                doctor=dp, status='completed').count()
            revenue = Payment.objects.filter(
                appointment__doctor=dp, status='success'
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Occupancy: slots used vs available
            # Assuming 8hr day, 10min slots = 48 max per day, for 30 days
            max_slots_30d = 48 * 30
            occupancy = round((total_apts / max_slots_30d) * 100, 1) if max_slots_30d > 0 else 0

            doctors_data.append({
                'id': dp.id,
                'name': f"Dr. {dp.user.get_full_name()}",
                'username': dp.user.username,
                'specialization': dp.specialization,
                'experience': dp.experience_years,
                'fee': float(dp.consultation_fee),
                'is_approved': dp.is_approved,
                'work_hours': f"{dp.work_start_time} - {dp.work_end_time}",
                'total_appointments': total_apts,
                'confirmed': confirmed,
                'completed': completed,
                'revenue_generated': float(revenue),
                'occupancy_rate': min(occupancy, 100),
                'rating_score': round(min(3.5 + (completed * 0.1), 5.0), 1),
            })

        # Specialization stats
        spec_stats = {}
        for dp in DoctorProfile.objects.filter(is_approved=True):
            s = dp.specialization
            if s not in spec_stats:
                spec_stats[s] = {'count': 0, 'avg_fee': 0, 'fees': []}
            spec_stats[s]['count'] += 1
            spec_stats[s]['fees'].append(float(dp.consultation_fee))

        spec_list = []
        for s, v in spec_stats.items():
            spec_list.append({
                'specialization': s,
                'doctor_count': v['count'],
                'avg_fee': round(sum(v['fees']) / len(v['fees']), 0),
                'appointments': Appointment.objects.filter(
                    doctor__specialization=s).count()
            })
        spec_list.sort(key=lambda x: x['appointments'], reverse=True)

        return Response({
            'doctors': sorted(doctors_data,
                              key=lambda x: x['revenue_generated'], reverse=True),
            'specialization_stats': spec_list,
        })


class AdminMedicineAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)

        medicines = Medicine.objects.all()
        med_data = []
        for m in medicines:
            order_items = OrderItem.objects.filter(medicine=m)
            total_sold = sum(oi.quantity for oi in order_items)
            revenue = sum(
                float(oi.price_at_order) * oi.quantity for oi in order_items)
            med_data.append({
                'id': m.id,
                'name': m.name,
                'unit': m.unit,
                'price': float(m.price),
                'stock': m.stock,
                'is_available': m.is_available,
                'manufacturer': m.manufacturer,
                'total_sold': total_sold,
                'revenue': revenue,
                'status': 'critical' if m.stock == 0 else
                          'low' if m.stock < 50 else 'good',
            })

        # Order trends - last 14 days
        today = date.today()
        order_trend = []
        for i in range(13, -1, -1):
            d = today - timedelta(days=i)
            cnt = MedicineOrder.objects.filter(ordered_at__date=d).count()
            rev = MedicineOrder.objects.filter(
                ordered_at__date=d,
                status__in=['delivered', 'shipped', 'processing']
            ).aggregate(t=Sum('total_amount'))['t'] or 0
            order_trend.append({
                'date': d.strftime('%d %b'),
                'orders': cnt,
                'revenue': float(rev),
            })

        # Order status breakdown
        status_counts = {}
        for s in ['placed', 'processing', 'shipped', 'delivered', 'cancelled']:
            status_counts[s] = MedicineOrder.objects.filter(status=s).count()

        return Response({
            'medicines': sorted(med_data,
                                key=lambda x: x['total_sold'], reverse=True),
            'summary': {
                'total_medicines': medicines.count(),
                'available': medicines.filter(is_available=True).count(),
                'low_stock': medicines.filter(stock__lt=50, stock__gt=0).count(),
                'out_of_stock': medicines.filter(stock=0).count(),
                'total_revenue': sum(m['revenue'] for m in med_data),
            },
            'order_trend': order_trend,
            'order_status': status_counts,
        })


class AdminNotificationView(APIView):
    """Admin sends notifications/suggestions to doctors"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)

        from .models import AdminNotification
        doctor_id = request.data.get('doctor_id')  # None = broadcast
        message = request.data.get('message', '').strip()
        notif_type = request.data.get('type', 'info')  # info, suggestion, warning

        if not message:
            return Response({'error': 'Message required'}, status=400)

        if doctor_id:
            try:
                doctor = DoctorProfile.objects.get(pk=doctor_id)
                notif = AdminNotification.objects.create(
                    sender=request.user,
                    recipient_doctor=doctor,
                    message=message,
                    notif_type=notif_type,
                    is_broadcast=False,
                )
            except DoctorProfile.DoesNotExist:
                return Response({'error': 'Doctor not found'}, status=404)
        else:
            notif = AdminNotification.objects.create(
                sender=request.user,
                message=message,
                notif_type=notif_type,
                is_broadcast=True,
            )

        return Response({'message': 'Notification sent!', 'id': notif.id})

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)

        from .models import AdminNotification
        notifs = AdminNotification.objects.all().order_by('-created_at')[:50]
        return Response([{
            'id': n.id,
            'message': n.message,
            'type': n.notif_type,
            'is_broadcast': n.is_broadcast,
            'recipient': f"Dr. {n.recipient_doctor.user.get_full_name()}" if n.recipient_doctor else 'All Doctors',
            'created_at': n.created_at,
            'is_read': n.is_read,
        } for n in notifs])


class DoctorNotificationsView(APIView):
    """Doctor apni notifications dekhta hai"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'doctor':
            return Response({'error': 'Doctors only'}, status=403)

        from .models import AdminNotification
        try:
            dp = request.user.doctor_profile
        except Exception:
            return Response([])

        notifs = AdminNotification.objects.filter(
            Q(is_broadcast=True) | Q(recipient_doctor=dp)
        ).order_by('-created_at')[:20]

        # Mark as read
        notifs.update(is_read=True)

        return Response([{
            'id': n.id,
            'message': n.message,
            'type': n.notif_type,
            'from': 'Admin',
            'created_at': n.created_at,
        } for n in notifs])