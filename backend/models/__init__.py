# EMR Models Package
from .emr import (
    Base, User, Doctor, Patient, Appointment, Encounter, Vital,
    Diagnosis, Allergy, Medication, Prescription, LabOrder, LabResult,
    Document, AuditLog, Notification, get_db, init_db
)
