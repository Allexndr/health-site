"""
EMR (Electronic Medical Record) Models
"""
from sqlalchemy import (
    create_engine, Column, Integer, String, ForeignKey, DateTime, 
    Boolean, Text, Float, Date, Enum, Table
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

from backend.config import settings

engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Association tables for many-to-many relationships
patient_allergies = Table(
    'patient_allergies',
    Base.metadata,
    Column('patient_id', Integer, ForeignKey('patients.id')),
    Column('allergy_id', Integer, ForeignKey('allergies.id'))
)

patient_chronic_diseases = Table(
    'patient_chronic_diseases',
    Base.metadata,
    Column('patient_id', Integer, ForeignKey('patients.id')),
    Column('diagnosis_id', Integer, ForeignKey('diagnoses.id'))
)


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    PATIENT = "patient"
    STAFF = "staff"


class Gender(str, enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class AppointmentStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Priority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class PrescriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LabStatus(str, enum.Enum):
    ORDERED = "ordered"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    phone = Column(String)
    role = Column(String, default=UserRole.PATIENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    doctor_profile = relationship("Doctor", back_populates="user", uselist=False)
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    license_number = Column(String)
    specialty = Column(String)
    department = Column(String)
    bio = Column(Text)
    education = Column(Text)
    experience_years = Column(Integer)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="doctor_profile")
    appointments = relationship("Appointment", back_populates="doctor")
    encounters = relationship("Encounter", back_populates="doctor")
    prescriptions = relationship("Prescription", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Demographics
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    middle_name = Column(String)
    date_of_birth = Column(Date)
    gender = Column(String)
    blood_type = Column(String)
    
    # Contact Information
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    emergency_contact_name = Column(String)
    emergency_contact_phone = Column(String)
    
    # Insurance
    insurance_provider = Column(String)
    insurance_policy_number = Column(String)
    
    # Medical Summary
    primary_doctor_id = Column(Integer, ForeignKey("doctors.id"))
    notes = Column(Text)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="patient_profile")
    primary_doctor = relationship("Doctor")
    appointments = relationship("Appointment", back_populates="patient")
    encounters = relationship("Encounter", back_populates="patient")
    vitals = relationship("Vital", back_populates="patient")
    documents = relationship("Document", back_populates="patient")
    prescriptions = relationship("Prescription", back_populates="patient")
    lab_orders = relationship("LabOrder", back_populates="patient")
    allergies = relationship("Allergy", secondary=patient_allergies, back_populates="patients")
    chronic_diseases = relationship("Diagnosis", secondary=patient_chronic_diseases)


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    
    appointment_date = Column(Date, nullable=False)
    appointment_time = Column(String)
    duration_minutes = Column(Integer, default=30)
    
    type = Column(String)
    reason = Column(Text)
    notes = Column(Text)
    room = Column(String)
    
    status = Column(String, default=AppointmentStatus.SCHEDULED)
    priority = Column(String, default=Priority.NORMAL)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="appointments")
    doctor = relationship("Doctor", back_populates="appointments")
    encounter = relationship("Encounter", back_populates="appointment", uselist=False)


class Encounter(Base):
    """Medical visit/encounter record"""
    __tablename__ = "encounters"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    appointment_id = Column(Integer, ForeignKey("appointments.id"), nullable=True)
    
    encounter_date = Column(DateTime, default=datetime.utcnow)
    encounter_type = Column(String)  # outpatient, inpatient, emergency, telemedicine
    
    # Chief Complaint and History
    chief_complaint = Column(Text)
    history_of_present_illness = Column(Text)
    review_of_systems = Column(Text)
    
    # Examination
    physical_examination = Column(Text)
    assessment_and_plan = Column(Text)
    
    # Diagnosis
    primary_diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"))
    secondary_diagnosis_ids = Column(Text)  # JSON array of diagnosis IDs
    
    # Status
    status = Column(String, default="in_progress")  # in_progress, completed, cancelled
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="encounters")
    doctor = relationship("Doctor", back_populates="encounters")
    appointment = relationship("Appointment", back_populates="encounter")
    primary_diagnosis = relationship("Diagnosis")
    vitals = relationship("Vital", back_populates="encounter")


class Vital(Base):
    """Vital signs recorded during encounters"""
    __tablename__ = "vitals"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    
    recorded_at = Column(DateTime, default=datetime.utcnow)
    recorded_by = Column(Integer, ForeignKey("doctors.id"))
    
    # Measurements
    temperature = Column(Float)
    temperature_unit = Column(String, default="celsius")
    heart_rate = Column(Integer)  # bpm
    respiratory_rate = Column(Integer)  # breaths per minute
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    oxygen_saturation = Column(Float)  # SpO2 percentage
    weight_kg = Column(Float)
    height_cm = Column(Float)
    bmi = Column(Float)
    
    notes = Column(Text)
    
    # Relationships
    patient = relationship("Patient", back_populates="vitals")
    encounter = relationship("Encounter", back_populates="vitals")


class Diagnosis(Base):
    """ICD-10 or custom diagnoses"""
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)  # ICD-10 code
    name = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String)
    is_chronic = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patients = relationship("Patient", secondary=patient_chronic_diseases)
    allergies = relationship("Allergy", back_populates="diagnosis")


class Allergy(Base):
    """Patient allergies"""
    __tablename__ = "allergies"

    id = Column(Integer, primary_key=True, index=True)
    allergen = Column(String, nullable=False)
    allergy_type = Column(String)  # medication, food, environmental, other
    severity = Column(String)  # mild, moderate, severe, life_threatening
    reaction_description = Column(Text)
    onset_date = Column(Date)
    diagnosis_id = Column(Integer, ForeignKey("diagnoses.id"))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    patients = relationship("Patient", secondary=patient_allergies, back_populates="allergies")
    diagnosis = relationship("Diagnosis", back_populates="allergies")


class Medication(Base):
    """Medication catalog"""
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    generic_name = Column(String)
    brand_name = Column(String)
    dosage_form = Column(String)  # tablet, capsule, injection, etc.
    strength = Column(String)
    manufacturer = Column(String)
    category = Column(String)
    description = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    prescriptions = relationship("Prescription", back_populates="medication")


class Prescription(Base):
    """Medication prescriptions"""
    __tablename__ = "prescriptions"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    medication_id = Column(Integer, ForeignKey("medications.id"))
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    quantity = Column(String)
    route = Column(String)  # oral, iv, im, topical, etc.
    instructions = Column(Text)
    
    prescribed_date = Column(DateTime, default=datetime.utcnow)
    start_date = Column(Date)
    end_date = Column(Date)
    
    status = Column(String, default=PrescriptionStatus.ACTIVE)
    refills = Column(Integer, default=0)
    refills_remaining = Column(Integer, default=0)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="prescriptions")
    doctor = relationship("Doctor", back_populates="prescriptions")
    medication = relationship("Medication", back_populates="prescriptions")


class LabOrder(Base):
    """Laboratory test orders"""
    __tablename__ = "lab_orders"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    
    order_date = Column(DateTime, default=datetime.utcnow)
    test_name = Column(String, nullable=False)
    test_code = Column(String)
    test_category = Column(String)  # blood, urine, imaging, etc.
    
    status = Column(String, default=LabStatus.ORDERED)
    priority = Column(String, default=Priority.NORMAL)
    
    clinical_indication = Column(Text)
    fasting_required = Column(Boolean, default=False)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    patient = relationship("Patient", back_populates="lab_orders")
    results = relationship("LabResult", back_populates="order")


class LabResult(Base):
    """Laboratory test results"""
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("lab_orders.id"))
    
    result_date = Column(DateTime)
    test_component = Column(String)
    value = Column(String)
    unit = Column(String)
    reference_range = Column(String)
    status = Column(String)  # normal, abnormal, critical
    interpretation = Column(Text)
    
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    order = relationship("LabOrder", back_populates="results")


class Document(Base):
    """Medical documents and attachments"""
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    encounter_id = Column(Integer, ForeignKey("encounters.id"), nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"))
    
    document_type = Column(String)  # lab_report, imaging, discharge_summary, referral, etc.
    title = Column(String)
    description = Column(Text)
    file_path = Column(String)
    file_type = Column(String)
    file_size = Column(Integer)
    
    document_date = Column(Date)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    is_confidential = Column(Boolean, default=False)
    
    # Relationships
    patient = relationship("Patient", back_populates="documents")


class AuditLog(Base):
    """Audit trail for all EMR activities"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String, nullable=False)  # create, update, delete, view
    entity_type = Column(String, nullable=False)  # patient, appointment, encounter, etc.
    entity_id = Column(Integer)
    details = Column(Text)
    ip_address = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")


class Notification(Base):
    """User notifications"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    title = Column(String, nullable=False)
    message = Column(Text)
    notification_type = Column(String)  # appointment_reminder, result_ready, message, etc.
    
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    read_at = Column(DateTime)


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
