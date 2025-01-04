from django.urls import path
from .views import *

urlpatterns = [
    path('getPatients/', getPatients, name='getPatients'),
]