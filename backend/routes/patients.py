"""
EMR Patients API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date

from backend.models.emr import (
    get_db, Patient, Doctor, Appointment, Encounter, 
    Vital, Prescription, LabOrder, Document, Allergy, 
    Diagnosis, patient_allergies, patient_chronic_diseases
)
from backend.schemas.emr import (
    PatientCreate, PatientResponse, PatientListResponse, 
    PatientDetailResponse, PatientUpdate, AllergyCreate, 
    AllergyResponse, VitalCreate, VitalResponse,
    AppointmentCreate, AppointmentResponse
)

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("/", response_model=List[PatientListResponse])
def get_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get list of patients with optional filtering"""
    query = db.query(Patient)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_filter)) |
            (Patient.last_name.ilike(search_filter)) |
            (Patient.phone.ilike(search_filter)) |
            (Patient.email.ilike(search_filter))
        )
    
    if doctor_id:
        query = query.filter(Patient.primary_doctor_id == doctor_id)
    
    patients = query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()
    return patients


@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db)):
    """Create a new patient"""
    db_patient = Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient


@router.get("/{patient_id}", response_model=PatientDetailResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    """Get detailed patient information including medical history"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Load related data
    patient.allergies = db.query(Allergy).join(
        patient_allergies
    ).filter(patient_allergies.c.patient_id == patient_id).all()
    
    patient.chronic_diseases = db.query(Diagnosis).join(
        patient_chronic_diseases
    ).filter(patient_chronic_diseases.c.patient_id == patient_id).all()
    
    patient.vitals = db.query(Vital).filter(
        Vital.patient_id == patient_id
    ).order_by(Vital.recorded_at.desc()).limit(10).all()
    
    patient.prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).order_by(Prescribed_date.desc()).limit(10).all()
    
    patient.appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient_id
    ).order_by(Appointment.appointment_date.desc()).limit(10).all()
    
    patient.encounters = db.query(Encounter).filter(
        Encounter.patient_id == patient_id
    ).order_by(Encounter.encounter_date.desc()).limit(10).all()
    
    patient.documents = db.query(Document).filter(
        Document.patient_id == patient_id
    ).order_by(Document.uploaded_at.desc()).limit(10).all()
    
    patient.lab_orders = db.query(LabOrder).filter(
        LabOrder.patient_id == patient_id
    ).order_by(LabOrder.order_date.desc()).limit(10).all()
    
    return patient


@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int, 
    patient_update: PatientUpdate, 
    db: Session = Depends(get_db)
):
    """Update patient information"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    update_data = patient_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    patient.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(patient_id: int, db: Session = Depends(get_db)):
    """Delete a patient (soft delete recommended in production)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db.delete(patient)
    db.commit()
    return None


# Patient Allergies
@router.get("/{patient_id}/allergies", response_model=List[AllergyResponse])
def get_patient_allergies(patient_id: int, db: Session = Depends(get_db)):
    """Get patient allergies"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    allergies = db.query(Allergy).join(
        patient_allergies
    ).filter(patient_allergies.c.patient_id == patient_id).all()
    
    return allergies


@router.post("/{patient_id}/allergies", response_model=AllergyResponse)
def add_patient_allergy(
    patient_id: int, 
    allergy: AllergyCreate, 
    db: Session = Depends(get_db)
):
    """Add allergy to patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    db_allergy = Allergy(**allergy.dict())
    db.add(db_allergy)
    db.commit()
    db.refresh(db_allergy)
    
    # Add to association table
    db.execute(
        patient_allergies.insert().values(
            patient_id=patient_id, 
            allergy_id=db_allergy.id
        )
    )
    db.commit()
    
    return db_allergy


# Patient Vitals
@router.get("/{patient_id}/vitals", response_model=List[VitalResponse])
def get_patient_vitals(
    patient_id: int, 
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get patient vital signs history"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    vitals = db.query(Vital).filter(
        Vital.patient_id == patient_id
    ).order_by(Vital.recorded_at.desc()).limit(limit).all()
    
    return vitals


@router.post("/{patient_id}/vitals", response_model=VitalResponse)
def add_patient_vital(
    patient_id: int, 
    vital: VitalCreate, 
    db: Session = Depends(get_db)
):
    """Add vital signs for patient"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Calculate BMI if weight and height provided
    bmi = None
    if vital.weight_kg and vital.height_cm:
        height_m = vital.height_cm / 100
        bmi = round(vital.weight_kg / (height_m * height_m), 2)
    
    db_vital = Vital(
        patient_id=patient_id,
        encounter_id=vital.encounter_id,
        recorded_by=vital.recorded_by,
        temperature=vital.temperature,
        temperature_unit=vital.temperature_unit,
        heart_rate=vital.heart_rate,
        respiratory_rate=vital.respiratory_rate,
        blood_pressure_systolic=vital.blood_pressure_systolic,
        blood_pressure_diastolic=vital.blood_pressure_diastolic,
        oxygen_saturation=vital.oxygen_saturation,
        weight_kg=vital.weight_kg,
        height_cm=vital.height_cm,
        bmi=bmi,
        notes=vital.notes
    )
    
    db.add(db_vital)
    db.commit()
    db.refresh(db_vital)
    return db_vital


# Patient Timeline
@router.get("/{patient_id}/timeline")
def get_patient_timeline(
    patient_id: int, 
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get comprehensive patient timeline (encounters, appointments, lab orders, prescriptions)"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    timeline = []
    
    # Add encounters
    encounters = db.query(Encounter).filter(
        Encounter.patient_id == patient_id
    ).all()
    for enc in encounters:
        timeline.append({
            "type": "encounter",
            "date": enc.encounter_date,
            "title": f"Прием: {enc.encounter_type or 'консультация'}",
            "description": enc.chief_complaint or "",
            "id": enc.id,
            "status": enc.status
        })
    
    # Add appointments
    appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient_id
    ).all()
    for appt in appointments:
        timeline.append({
            "type": "appointment",
            "date": datetime.combine(appt.appointment_date, datetime.min.time()),
            "title": f"Запись: {appt.type or 'прием'}",
            "description": appt.reason or "",
            "id": appt.id,
            "status": appt.status
        })
    
    # Add lab orders
    lab_orders = db.query(LabOrder).filter(
        LabOrder.patient_id == patient_id
    ).all()
    for lab in lab_orders:
        timeline.append({
            "type": "lab_order",
            "date": lab.order_date,
            "title": f"Анализ: {lab.test_name}",
            "description": lab.clinical_indication or "",
            "id": lab.id,
            "status": lab.status
        })
    
    # Add prescriptions
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).all()
    for rx in prescriptions:
        timeline.append({
            "type": "prescription",
            "date": rx.prescribed_date,
            "title": f"Назначение: {rx.medication.name if hasattr(rx, 'medication') else 'препарат'}",
            "description": rx.dosage or "",
            "id": rx.id,
            "status": rx.status
        })
    
    # Sort by date descending
    timeline.sort(key=lambda x: x["date"], reverse=True)
    
    return timeline[:limit]


# Patient Statistics
@router.get("/{patient_id}/stats")
def get_patient_stats(patient_id: int, db: Session = Depends(get_db)):
    """Get patient statistics summary"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    total_appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient_id
    ).count()
    
    total_encounters = db.query(Encounter).filter(
        Encounter.patient_id == patient_id
    ).count()
    
    active_prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id,
        Prescription.status == "active"
    ).count()
    
    pending_lab_orders = db.query(LabOrder).filter(
        LabOrder.patient_id == patient_id,
        LabOrder.status.in_(["ordered", "in_progress"])
    ).count()
    
    total_documents = db.query(Document).filter(
        Document.patient_id == patient_id
    ).count()
    
    allergy_count = db.query(Allergy).join(
        patient_allergies
    ).filter(patient_allergies.c.patient_id == patient_id).count()
    
    # Last visit
    last_appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.appointment_date <= date.today()
    ).order_by(Appointment.appointment_date.desc()).first()
    
    # Next appointment
    next_appointment = db.query(Appointment).filter(
        Appointment.patient_id == patient_id,
        Appointment.appointment_date >= date.today(),
        Appointment.status.in_(["scheduled", "confirmed"])
    ).order_by(Appointment.appointment_date.asc()).first()
    
    return {
        "total_appointments": total_appointments,
        "total_encounters": total_encounters,
        "active_prescriptions": active_prescriptions,
        "pending_lab_orders": pending_lab_orders,
        "total_documents": total_documents,
        "allergy_count": allergy_count,
        "last_visit": last_appointment.appointment_date if last_appointment else None,
        "next_visit": next_appointment.appointment_date if next_appointment else None
    }
