from django.urls import path
from .views import RegisterView, LoginView, ProfileView
from .admin_views import (
    AdminDashboardView, AdminUsersView,
    AdminRevenueAnalyticsView, AdminDoctorAnalyticsView,
    AdminMedicineAnalyticsView, AdminNotificationView,
    DoctorNotificationsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUsersView.as_view(), name='admin-user-detail'),
    path('admin/analytics/revenue/', AdminRevenueAnalyticsView.as_view(), name='revenue-analytics'),
    path('admin/analytics/doctors/', AdminDoctorAnalyticsView.as_view(), name='doctor-analytics'),
    path('admin/analytics/medicines/', AdminMedicineAnalyticsView.as_view(), name='medicine-analytics'),
    path('admin/notifications/', AdminNotificationView.as_view(), name='admin-notifications'),
    path('doctor/notifications/', DoctorNotificationsView.as_view(), name='doctor-notifications'),
]