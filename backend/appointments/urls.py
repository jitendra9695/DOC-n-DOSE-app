from django.urls import path
from .views import (
    AvailableSlotsView,
    BookAppointmentView,
    MyAppointmentsView,
    AppointmentDetailView,
    WritePrescriptionView,
    DoctorHistoryView,
    PatientHistoryView,
    DeleteAppointmentView,
)

urlpatterns = [
    path('slots/<int:doctor_id>/',          AvailableSlotsView.as_view(),    name='available-slots'),
    path('book/',                           BookAppointmentView.as_view(),   name='book-appointment'),
    path('my/',                             MyAppointmentsView.as_view(),    name='my-appointments'),
    path('<int:pk>/',                       AppointmentDetailView.as_view(), name='appointment-detail'),
    path('<int:appointment_id>/prescribe/', WritePrescriptionView.as_view(), name='write-prescription'),
    path('<int:pk>/delete/',               DeleteAppointmentView.as_view(), name='delete-appointment'),
    path('doctor/history/',                DoctorHistoryView.as_view(),     name='doctor-history'),
    path('patient/history/',               PatientHistoryView.as_view(),    name='patient-history'),
]
