from django.urls import path
from .views import DoctorListView, DoctorDetailView, MyDoctorProfileView, AdminDoctorManageView, DoctorAvailabilityToggleView

urlpatterns = [
    path('', DoctorListView.as_view(), name='doctor-list'),
    path('<int:pk>/', DoctorDetailView.as_view(), name='doctor-detail'),
    path('my-profile/', MyDoctorProfileView.as_view(), name='my-doctor-profile'),
    path('admin/all/', AdminDoctorManageView.as_view(), name='admin-doctors'),
    path('admin/<int:pk>/approve/', AdminDoctorManageView.as_view(), name='approve-doctor'),
    path('my-profile/availability/', DoctorAvailabilityToggleView.as_view(), name='doctor-availability'),
]