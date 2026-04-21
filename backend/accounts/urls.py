from django.urls import path
from .views import RegisterView, LoginView, ProfileView
from .admin_views import AdminDashboardView, AdminUsersView
from .analytics_views import (
    AppointmentAnalyticsView, DoctorAnalyticsView,
    MedicineAnalyticsView, FinancialAnalyticsView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/users/', AdminUsersView.as_view(), name='admin-users'),
    path('admin/users/<int:user_id>/', AdminUsersView.as_view(), name='admin-user-detail'),
    path('admin/analytics/appointments/', AppointmentAnalyticsView.as_view()),
    path('admin/analytics/doctors/',      DoctorAnalyticsView.as_view()),
    path('admin/analytics/medicines/',    MedicineAnalyticsView.as_view()),
    path('admin/analytics/financial/',    FinancialAnalyticsView.as_view()),
]