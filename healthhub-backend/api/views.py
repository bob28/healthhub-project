from rest_framework.decorators import api_view 
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializer import DoctorSerializer, PatientSerializer, ProviderSerializer, AppointmentSerializer, TestSerializer

# Create your views here.

@api_view(['GET'])
def getPatients(request):
    patients = Patient.objects.all()
    serializer = PatientSerializer(patients, many=True).data
    print(serializer)
    return Response({"patients": serializer})