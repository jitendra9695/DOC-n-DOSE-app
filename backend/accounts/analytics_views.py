"""
DocNDoSe — Analytics Views
Place this file at: backend/accounts/analytics_views.py

Then add to backend/accounts/urls.py:

from .analytics_views import AnalyticsSummaryView

urlpatterns += [
    path('admin/analytics/', AnalyticsSummaryView.as_view(), name='analytics'),
]
"""

from collections import defaultdict
from datetime import date, timedelta
from django.db.models import Count, Sum, Q, Avg
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from appointments.models import Appointment
from doctors.models import DoctorProfile
from pharmacy.models import Medicine, MedicineOrder, OrderItem
from payments.models import Payment


class AnalyticsSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin only'}, status=403)

        today       = date.today()
        thirty_ago  = today - timedelta(days=30)
        twelve_ago  = today - timedelta(weeks=12)

        # ── KPI cards ─────────────────────────────────────────────────────────
        total_revenue = float(
            Payment.objects.filter(status='success')
            .aggregate(t=Sum('amount'))['t'] or 0
        )
        month_revenue = float(
            Payment.objects.filter(status='success', paid_at__date__gte=today.replace(day=1))
            .aggregate(t=Sum('amount'))['t'] or 0
        )
        total_appointments  = Appointment.objects.count()
        total_patients      = Appointment.objects.values('patient').distinct().count()
        payment_success     = Payment.objects.filter(status='success').count()
        payment_failed      = Payment.objects.filter(status='failed').count()
        low_stock_count     = Medicine.objects.filter(stock__lte=10, stock__gt=0).count()
        out_of_stock_count  = Medicine.objects.filter(stock=0).count()

        # ── Daily appointments last 30 days ───────────────────────────────────
        daily_apts = list(
            Appointment.objects
            .filter(appointment_date__gte=thirty_ago)
            .values('appointment_date')
            .annotate(count=Count('id'))
            .order_by('appointment_date')
        )
        daily_apts = [{'date': str(r['appointment_date']), 'count': r['count']} for r in daily_apts]

        # ── Weekly appointments last 12 weeks ─────────────────────────────────
        weekly_raw = (
            Appointment.objects
            .filter(appointment_date__gte=twelve_ago)
            .values('appointment_date')
            .annotate(count=Count('id'))
        )
        weekly_map = defaultdict(int)
        for r in weekly_raw:
            d = r['appointment_date']
            ws = d - timedelta(days=d.weekday())
            weekly_map[str(ws)] += r['count']
        weekly_apts = [{'week': k, 'count': v} for k, v in sorted(weekly_map.items())]

        # ── Top 5 busiest doctors ─────────────────────────────────────────────
        top_doctors = list(
            Appointment.objects
            .values('doctor__user__first_name', 'doctor__user__last_name', 'doctor__specialization')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        top_doctors = [
            {
                'name':  f"Dr. {r['doctor__user__first_name']} {r['doctor__user__last_name']}",
                'spec':  r['doctor__specialization'],
                'count': r['count'],
            }
            for r in top_doctors
        ]

        # ── Appointment status breakdown ──────────────────────────────────────
        status_counts = dict(
            Appointment.objects.values('status').annotate(c=Count('id')).values_list('status', 'c')
        )

        # ── Revenue by specialization ─────────────────────────────────────────
        rev_by_spec = list(
            Payment.objects.filter(status='success')
            .values('appointment__doctor__specialization')
            .annotate(revenue=Sum('amount'), txns=Count('id'))
            .order_by('-revenue')
        )
        rev_by_spec = [
            {'spec': r['appointment__doctor__specialization'] or 'N/A',
             'revenue': float(r['revenue'] or 0), 'txns': r['txns']}
            for r in rev_by_spec
        ]

        # ── Daily revenue last 30 days ────────────────────────────────────────
        daily_rev = list(
            Payment.objects.filter(status='success', paid_at__date__gte=thirty_ago)
            .values('paid_at__date')
            .annotate(revenue=Sum('amount'), count=Count('id'))
            .order_by('paid_at__date')
        )
        daily_rev = [
            {'date': str(r['paid_at__date']), 'revenue': float(r['revenue'] or 0), 'count': r['count']}
            for r in daily_rev
        ]

        # ── Medicine stock alerts ─────────────────────────────────────────────
        medicines = list(
            Medicine.objects.values('name', 'stock', 'price', 'unit', 'is_available').order_by('stock')
        )
        for m in medicines:
            m['price'] = float(m['price'])
            m['alert'] = 'critical' if m['stock'] <= 5 else 'low' if m['stock'] <= 10 else 'ok'

        # ── Top 10 selling medicines ──────────────────────────────────────────
        top_meds = list(
            OrderItem.objects
            .values('medicine__name', 'medicine__unit')
            .annotate(sold=Sum('quantity'), revenue=Sum('price_at_order'))
            .order_by('-sold')[:10]
        )
        top_meds = [
            {'name': r['medicine__name'], 'sold': r['sold'] or 0, 'revenue': float(r['revenue'] or 0)}
            for r in top_meds
        ]

        # ── Payment donut ─────────────────────────────────────────────────────
        payment_donut = [
            {'name': 'Success', 'value': payment_success, 'color': '#10B981'},
            {'name': 'Failed',  'value': payment_failed,  'color': '#F43F5E'},
            {'name': 'Pending', 'value': Payment.objects.filter(status='pending').count(), 'color': '#F59E0B'},
        ]

        # ── Heatmap — peak booking hours ──────────────────────────────────────
        heatmap_raw = Appointment.objects.filter(
            appointment_date__gte=thirty_ago
        ).values('appointment_time', 'appointment_date')
        DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        hmap = defaultdict(int)
        for r in heatmap_raw:
            t = r['appointment_time']
            d = r['appointment_date']
            hr = t.hour if hasattr(t, 'hour') else int(str(t)[:2])
            hmap[(DAYS[d.weekday()], hr)] += 1
        heatmap = [{'day': d, 'hour': h, 'count': c} for (d, h), c in hmap.items()]

        # ── Doctor patient volume ─────────────────────────────────────────────
        doctor_volume = list(
            Appointment.objects
            .values('doctor__user__first_name', 'doctor__user__last_name', 'doctor__specialization')
            .annotate(patients=Count('id'))
            .order_by('-patients')
        )
        doctor_volume = [
            {'name': f"Dr. {r['doctor__user__first_name']} {r['doctor__user__last_name']}",
             'spec': r['doctor__specialization'], 'patients': r['patients']}
            for r in doctor_volume
        ]

        return Response({
            # KPIs
            'kpi': {
                'total_revenue':       total_revenue,
                'month_revenue':       month_revenue,
                'total_appointments':  total_appointments,
                'total_patients':      total_patients,
                'payment_success':     payment_success,
                'payment_failed':      payment_failed,
                'low_stock_count':     low_stock_count,
                'out_of_stock_count':  out_of_stock_count,
                'avg_transaction':     float(Payment.objects.filter(status='success').aggregate(a=Avg('amount'))['a'] or 0),
            },
            # Charts
            'daily_appointments':  daily_apts,
            'weekly_appointments': weekly_apts,
            'top_doctors':         top_doctors,
            'status_breakdown':    [
                {'name': 'Confirmed',      'value': status_counts.get('confirmed', 0),       'color': '#10B981'},
                {'name': 'Completed',      'value': status_counts.get('completed', 0),       'color': '#0EA5BE'},
                {'name': 'Pending',        'value': status_counts.get('pending_payment', 0), 'color': '#F59E0B'},
                {'name': 'Cancelled',      'value': status_counts.get('cancelled', 0),       'color': '#F43F5E'},
            ],
            'revenue_by_spec':   rev_by_spec,
            'daily_revenue':     daily_rev,
            'payment_donut':     payment_donut,
            'medicines_stock':   medicines,
            'top_medicines':     top_meds,
            'heatmap':           heatmap,
            'doctor_volume':     doctor_volume,
        })
