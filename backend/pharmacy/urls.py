from django.urls import path
from .views import MedicineListView, PharmacyInventoryView, PlaceOrderView, OrderTrackView

urlpatterns = [
    path('medicines/', MedicineListView.as_view(), name='medicine-list'),
    path('inventory/', PharmacyInventoryView.as_view(), name='inventory'),
    path('inventory/<int:pk>/', PharmacyInventoryView.as_view(), name='inventory-update'),
    path('order/', PlaceOrderView.as_view(), name='place-order'),
    path('orders/', OrderTrackView.as_view(), name='track-orders'),
    path('orders/<int:order_id>/', OrderTrackView.as_view(), name='update-order'),
]