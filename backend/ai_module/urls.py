from django.urls import path
from .views import SymptomCheckerView, SymptomChatView

urlpatterns = [
    path('symptom-check/', SymptomCheckerView.as_view(), name='symptom-check'),
    path('symptom-chat/',  SymptomChatView.as_view(),    name='symptom-chat'),
]
