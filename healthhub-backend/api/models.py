from django.db import models

# Create your models here.

class Doctor (models.Model):
    '''
    Doctor model:
    - doctorId: primary key
    - firstName: first name of the doctor
    - lastName: last name of the doctor
    - email: email of the doctor
    - password: password of the doctor
    - createdAt: created at date
    - updatedAt: updated at date
    '''
    doctorId = models.IntegerField(primary_key=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        # return the doctor's full name and email
        return "Doctor " + self.firstName + " " + self.lastName + " (" + self.email + ")"

class Patient(models.Model):
    '''
    Patient model:
    - patientId: primary key
    - firstName: first name of the patient
    - lastName: last name of the patient
    - email: email of the patient
    - password: password of the patient
    - dob: date of birth of the patient
    - doctor: foreign key to Doctor model who is the primary care physician
    - createdAt: created at date
    - updatedAt: updated at date
    '''
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
    '''
    Provider model:
    - providerId: primary key
    - firstName: first name of the provider
    - lastName: last name of the provider
    - email: email of the provider
    - password: password of the provider
    - createdAt: created at date
    - updatedAt: updated at date
    - address: address of the provider
    '''
    providerId = models.IntegerField(primary_key=True)
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    password = models.CharField(max_length=500)
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)
    address = models.CharField(max_length=100)

    def __str__(self):
        # return the provider's full name and email
        return "Provider " + self.firstName + " " + self.lastName + " (" + self.email + ")"

class Appointment(models.Model): 
    '''
    Appointment model:
    - appointmentId: primary key
    - patient: foreign key to Patient model who scheduled the appointment
    - provider: foreign key to Provider model to whom the appointment is scheduled with 
    - doctor: foreign key to Doctor model who either referred the patient or is the primary care physician
    - date: date of the appointment
    - createdAt: created at date
    - updatedAt: updated at date
    '''
    appointmentId = models.IntegerField(primary_key=True)
    patient = models.ForeignKey(Patient, on_delete=models.SET(0))
    provider = models.ForeignKey(Provider, on_delete=models.SET(0))
    doctor = models.ForeignKey(Doctor, on_delete=models.SET(0))
    date = models.DateTimeField()
    createdAt = models.DateTimeField(auto_now_add=True)
    updatedAt = models.DateTimeField(auto_now=True)

    def __str__(self):
        # return the appointment id, provider name, and date
        return "Appointment " + self.appointmentId + " with " + self.provider + " on " + self.date

class Test(models.Model):
    '''
    Test model: 
    - testId: primary key
    - name: name of the test
    - category: category of the test
    - type: type of the test
    - description: description of the test
    - preparation: preparation for the test
    - turnaroundTime: turnaround time for the test
    - sampleRequired: sample required for the test
    - fields: JSON field for additional fields
    - appointment: foreign key to Appointment model for which the test is scheduled
    - createdAt: created at date
    - updatedAt: updated at date    
    '''
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
        # return the test name, category, and appointment
        return "Test " + self.name + " (" + self.category + ") with " + self.appointment