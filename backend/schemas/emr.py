"""
EMR Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# Enums
class UserRole(str, Enum):
    ADMIN = "admin"
    DOCTOR = "doctor"
    NURSE = "nurse"
    PATIENT = "patient"
    STAFF = "staff"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class AppointmentStatus(str, Enum):
    SCHEDULED = "scheduled"
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    NO_SHOW = "no_show"


class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class PrescriptionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class LabStatus(str, Enum):
    ORDERED = "ordered"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Base Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    phone: Optional[str] = None
    role: UserRole = UserRole.PATIENT


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# Doctor Schemas
class DoctorBase(BaseModel):
    license_number: str
    specialty: str
    department: Optional[str] = None
    bio: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[int] = None


class DoctorCreate(DoctorBase):
    user_id: int


class DoctorResponse(DoctorBase):
    id: int
    user_id: int
    is_available: bool
    created_at: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


# Patient Schemas
class PatientBase(BaseModel):
    first_name: str
    last_name: str
    middle_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    blood_type: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    insurance_provider: Optional[str] = None
    insurance_policy_number: Optional[str] = None
    primary_doctor_id: Optional[int] = None
    notes: Optional[str] = None


class PatientCreate(PatientBase):
    user_id: Optional[int] = None


class PatientResponse(PatientBase):
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    primary_doctor: Optional[DoctorResponse] = None
    
    class Config:
        from_attributes = True


class PatientListResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    blood_type: Optional[str] = None
    primary_doctor_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Appointment Schemas
class AppointmentBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: Optional[str] = None
    duration_minutes: int = 30
    type: Optional[str] = None
    reason: Optional[str] = None
    notes: Optional[str] = None
    room: Optional[str] = None
    status: AppointmentStatus = AppointmentStatus.SCHEDULED
    priority: Priority = Priority.NORMAL


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None
    doctor_id: Optional[int] = None
    status: Optional[AppointmentStatus] = None
    priority: Optional[Priority] = None
    notes: Optional[str] = None
    reason: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientListResponse] = None
    doctor: Optional[DoctorResponse] = None
    
    class Config:
        from_attributes = True


# Vital Schemas
class VitalBase(BaseModel):
    temperature: Optional[float] = None
    temperature_unit: str = "celsius"
    heart_rate: Optional[int] = None
    respiratory_rate: Optional[int] = None
    blood_pressure_systolic: Optional[int] = None
    blood_pressure_diastolic: Optional[int] = None
    oxygen_saturation: Optional[float] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    bmi: Optional[float] = None
    notes: Optional[str] = None


class VitalCreate(VitalBase):
    patient_id: int
    encounter_id: Optional[int] = None
    recorded_by: int


class VitalResponse(VitalBase):
    id: int
    patient_id: int
    encounter_id: Optional[int] = None
    recorded_at: datetime
    
    class Config:
        from_attributes = True


# Diagnosis Schemas
class DiagnosisBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_chronic: bool = False


class DiagnosisCreate(DiagnosisBase):
    pass


class DiagnosisResponse(DiagnosisBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Allergy Schemas
class AllergyBase(BaseModel):
    allergen: str
    allergy_type: Optional[str] = None
    severity: Optional[str] = None
    reaction_description: Optional[str] = None
    onset_date: Optional[date] = None
    diagnosis_id: Optional[int] = None


class AllergyCreate(AllergyBase):
    pass


class AllergyResponse(AllergyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Medication Schemas
class MedicationBase(BaseModel):
    name: str
    generic_name: Optional[str] = None
    brand_name: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None


class MedicationCreate(MedicationBase):
    pass


class MedicationResponse(MedicationBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Prescription Schemas
class PrescriptionBase(BaseModel):
    patient_id: int
    doctor_id: int
    medication_id: int
    encounter_id: Optional[int] = None
    dosage: str
    frequency: str
    duration: Optional[str] = None
    quantity: Optional[str] = None
    route: Optional[str] = None
    instructions: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: PrescriptionStatus = PrescriptionStatus.ACTIVE
    refills: int = 0
    refills_remaining: int = 0
    notes: Optional[str] = None


class PrescriptionCreate(PrescriptionBase):
    pass


class PrescriptionUpdate(BaseModel):
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    status: Optional[PrescriptionStatus] = None
    end_date: Optional[date] = None
    refills_remaining: Optional[int] = None
    notes: Optional[str] = None


class PrescriptionResponse(PrescriptionBase):
    id: int
    prescribed_date: datetime
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientListResponse] = None
    doctor: Optional[DoctorResponse] = None
    medication: Optional[MedicationResponse] = None
    
    class Config:
        from_attributes = True


# Lab Order Schemas
class LabOrderBase(BaseModel):
    patient_id: int
    doctor_id: int
    encounter_id: Optional[int] = None
    test_name: str
    test_code: Optional[str] = None
    test_category: Optional[str] = None
    priority: Priority = Priority.NORMAL
    clinical_indication: Optional[str] = None
    fasting_required: bool = False
    notes: Optional[str] = None


class LabOrderCreate(LabOrderBase):
    pass


class LabOrderUpdate(BaseModel):
    status: Optional[LabStatus] = None
    priority: Optional[Priority] = None
    notes: Optional[str] = None


class LabOrderResponse(LabOrderBase):
    id: int
    order_date: datetime
    status: LabStatus
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientListResponse] = None
    
    class Config:
        from_attributes = True


# Lab Result Schemas
class LabResultBase(BaseModel):
    order_id: int
    result_date: Optional[datetime] = None
    test_component: str
    value: str
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: Optional[str] = None
    interpretation: Optional[str] = None
    notes: Optional[str] = None


class LabResultCreate(LabResultBase):
    pass


class LabResultResponse(LabResultBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# Encounter Schemas
class EncounterBase(BaseModel):
    patient_id: int
    doctor_id: int
    appointment_id: Optional[int] = None
    encounter_type: Optional[str] = "outpatient"
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    review_of_systems: Optional[str] = None
    physical_examination: Optional[str] = None
    assessment_and_plan: Optional[str] = None
    primary_diagnosis_id: Optional[int] = None
    secondary_diagnosis_ids: Optional[str] = None
    status: str = "in_progress"


class EncounterCreate(EncounterBase):
    pass


class EncounterUpdate(BaseModel):
    chief_complaint: Optional[str] = None
    history_of_present_illness: Optional[str] = None
    physical_examination: Optional[str] = None
    assessment_and_plan: Optional[str] = None
    primary_diagnosis_id: Optional[int] = None
    secondary_diagnosis_ids: Optional[str] = None
    status: Optional[str] = None


class EncounterResponse(EncounterBase):
    id: int
    encounter_date: datetime
    created_at: datetime
    updated_at: datetime
    patient: Optional[PatientListResponse] = None
    doctor: Optional[DoctorResponse] = None
    appointment: Optional[AppointmentResponse] = None
    primary_diagnosis: Optional[DiagnosisResponse] = None
    vitals: List[VitalResponse] = []
    
    class Config:
        from_attributes = True


# Document Schemas
class DocumentBase(BaseModel):
    patient_id: int
    encounter_id: Optional[int] = None
    document_type: str
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[int] = None
    document_date: Optional[date] = None
    is_confidential: bool = False


class DocumentCreate(DocumentBase):
    pass


class DocumentResponse(DocumentBase):
    id: int
    uploaded_by: int
    uploaded_at: datetime
    
    class Config:
        from_attributes = True


# Audit Log Schemas
class AuditLogBase(BaseModel):
    action: str
    entity_type: str
    entity_id: int
    details: Optional[str] = None
    ip_address: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    user_id: int


class AuditLogResponse(AuditLogBase):
    id: int
    user_id: int
    timestamp: datetime
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True


# Patient Detail Schema (comprehensive)
class PatientDetailResponse(PatientResponse):
    allergies: List[AllergyResponse] = []
    chronic_diseases: List[DiagnosisResponse] = []
    vitals: List[VitalResponse] = []
    prescriptions: List[PrescriptionResponse] = []
    appointments: List[AppointmentResponse] = []
    encounters: List[EncounterResponse] = []
    documents: List[DocumentResponse] = []
    lab_orders: List[LabOrderResponse] = []


# Dashboard Schemas
class DashboardStats(BaseModel):
    total_patients: int
    today_appointments: int
    pending_lab_orders: int
    active_prescriptions: int
    recent_encounters: int


class TodayAppointment(BaseModel):
    id: int
    patient_name: str
    time: str
    type: str
    doctor_name: str
    status: str
    priority: str


class DashboardResponse(BaseModel):
    stats: DashboardStats
    today_appointments: List[TodayAppointment]
    recent_patients: List[PatientListResponse]
