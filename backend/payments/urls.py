from django.urls import path
from .views import (
    CreateOrderView,
    VerifyPaymentView,
    PaymentFailedView,
    PaymentHistoryView,
)
from .medicine_payment_views import (
    MedicineOrderCreateView,
    MedicineOrderVerifyView,
)

urlpatterns = [
    # ── Appointment payment ───────────────────────────────────────────────────
    path('create-order/',    CreateOrderView.as_view(),    name='create-order'),
    path('verify/',          VerifyPaymentView.as_view(),   name='verify-payment'),
    path('failed/',          PaymentFailedView.as_view(),   name='payment-failed'),
    path('history/',         PaymentHistoryView.as_view(),  name='payment-history'),

    # ── Medicine payment ──────────────────────────────────────────────────────
    path('medicine-order/',  MedicineOrderCreateView.as_view(),  name='medicine-order-create'),
    path('medicine-verify/', MedicineOrderVerifyView.as_view(),  name='medicine-order-verify'),
]
