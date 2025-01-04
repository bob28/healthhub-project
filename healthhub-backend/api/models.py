from django.db import models

# Create your models here.

class Doctor (models.Model):
    doctorId = models.IntegerField(primary_key=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Doctor " + self.firstName + " " + self.lastName + " (" + self.email + ")"

class Patient(models.Model):
    patientId = models.IntegerField(primary_key=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=500)
    dob = models.DateField()
    doctor = models.ForeignKey(Doctor, on_delete=models.SET(0))
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Patient " + self.firstName + " " + self.lastName + " (" + self.email + ")"

class Provider(models.Model):
    providerId = models.IntegerField(primary_key=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    address = models.CharField(max_length=100)

    def __str__(self):
        return "Provider " + self.firstName + " " + self.lastName + " (" + self.email + ")"

class Appointment(models.Model): 
    appointmentId = models.IntegerField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.SET(0))
    provider = models.ForeignKey(Provider, on_delete=models.SET(0))
    doctor = models.ForeignKey(Doctor, on_delete=models.SET(0))
    date = models.DateTimeField()
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Appointment " + self.appointmentId + " with " + self.provider + " on " + self.date

class Test(models.Model):
    testId = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100)
    type = models.CharField(max_length=100)
    description = models.CharField(max_length=500)
    preparation = models.CharField(max_length=500)
    turnaroundTime = models.CharField(max_length=100)
    sampleRequired = models.CharField(max_length=100)
    fields = models.JSONField()
    appointment = models.ForeignKey(Appointment, on_delete=models.SET(0))
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        return "Test " + self.name + " (" + self.category + ") with " + self.appointment