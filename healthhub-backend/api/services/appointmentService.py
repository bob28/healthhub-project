from ..models import Appointment, Patient, Provider, Doctor, Test
from django.shortcuts import get_object_or_404

class AppointmentService:
    def __init__(self):
        pass 

    def createAppointment(self, appointmentData):
        pass

    def getAppointment(self, appointmentId):
        appointment = Appointment.objects.get(appointmentId=appointmentId)
        # get join working so that it can get the data from the other tables and add it to the appointment object TODO 
        return appointment

    def getAppointments(self, typeOfUser, userId):
        """
        Retrieves appointments based on the type of user and user ID.

        Args:
            typeOfUser (str): The type of user, which can be "patient", "provider", or "doctor".
            userId (int): The ID of the user.

        Returns:
            QuerySet or dict: A QuerySet of appointments if the user type is valid, 
                              otherwise a dictionary containing an error message.
        """
        if typeOfUser == "patient":
            appointments = Appointment.objects.filter(patientId=userId)
        elif typeOfUser == "provider":
            appointments = Appointment.objects.filter(providerId=userId)
        elif typeOfUser == "doctor":
            appointments = Appointment.objects.filter(doctorId=userId)
        else:
            # return error
            return {"error": "Invalid user type"}

        return appointments
            

    def updateAppointment(self, appointmentId, appointmentData):
        # make sure that the appointment exists before updating it
        appointment = get_object_or_404(Appointment, appointmentId=appointmentId)
        if not appointment:
            return {"error": "Appointment does not exist"}
        return Appointment.objects.filter(appointmentId=appointmentId).update(**appointmentData)

    def deleteAppointment(self, appointmentId):
        # TODO: this should be a soft delete
        return Appointment.objects.filter(appointmentId=appointmentId).delete()