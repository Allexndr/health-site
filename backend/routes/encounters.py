"""
EMR Encounters (Medical Visits) API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date

from backend.models.emr import (
    get_db, Encounter, Patient, Doctor, Appointment, Vital, Diagnosis
)
from backend.schemas.emr import (
    EncounterCreate, EncounterResponse, EncounterUpdate, VitalCreate, VitalResponse
)

router = APIRouter(prefix="/api/encounters", tags=["encounters"])


@router.get("/", response_model=List[EncounterResponse])
def get_encounters(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get encounters with optional filtering"""
    query = db.query(Encounter).options(
        joinedload(Encounter.patient),
        joinedload(Encounter.doctor),
        joinedload(Encounter.primary_diagnosis)
    )
    
    if patient_id:
        query = query.filter(Encounter.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(Encounter.doctor_id == doctor_id)
    
    if date_from:
        query = query.filter(Encounter.encounter_date >= date_from)
    
    if date_to:
        query = query.filter(Encounter.encounter_date <= date_to)
    
    if status:
        query = query.filter(Encounter.status == status)
    
    encounters = query.order_by(Encounter.encounter_date.desc()).offset(skip).limit(limit).all()
    return encounters


@router.post("/", response_model=EncounterResponse, status_code=status.HTTP_201_CREATED)
def create_encounter(encounter: EncounterCreate, db: Session = Depends(get_db)):
    """Create a new encounter/medical visit"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == encounter.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == encounter.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Verify appointment if provided
    if encounter.appointment_id:
        appointment = db.query(Appointment).filter(Appointment.id == encounter.appointment_id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")
    
    db_encounter = Encounter(**encounter.dict())
    db.add(db_encounter)
    db.commit()
    db.refresh(db_encounter)
    
    # Load relationships
    db_encounter.patient = patient
    db_encounter.doctor = doctor
    
    return db_encounter


@router.get("/{encounter_id}", response_model=EncounterResponse)
def get_encounter(encounter_id: int, db: Session = Depends(get_db)):
    """Get encounter details with vitals"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).options(
        joinedload(Encounter.patient),
        joinedload(Encounter.doctor),
        joinedload(Encounter.primary_diagnosis),
        joinedload(Encounter.appointment)
    ).first()
    
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    # Load vitals
    encounter.vitals = db.query(Vital).filter(Vital.encounter_id == encounter_id).all()
    
    return encounter


@router.put("/{encounter_id}", response_model=EncounterResponse)
def update_encounter(
    encounter_id: int, 
    encounter_update: EncounterUpdate, 
    db: Session = Depends(get_db)
):
    """Update encounter"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    update_data = encounter_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(encounter, field, value)
    
    encounter.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(encounter)
    
    # Load relationships
    encounter.patient = db.query(Patient).filter(Patient.id == encounter.patient_id).first()
    encounter.doctor = db.query(Doctor).filter(Doctor.id == encounter.doctor_id).first()
    if encounter.primary_diagnosis_id:
        encounter.primary_diagnosis = db.query(Diagnosis).filter(Diagnosis.id == encounter.primary_diagnosis_id).first()
    
    return encounter


@router.patch("/{encounter_id}/status")
def update_encounter_status(
    encounter_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update encounter status"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    valid_statuses = ["in_progress", "completed", "cancelled"]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    encounter.status = status
    encounter.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(encounter)
    
    return {"message": "Status updated", "status": status}


@router.delete("/{encounter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_encounter(encounter_id: int, db: Session = Depends(get_db)):
    """Delete encounter"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    db.delete(encounter)
    db.commit()
    return None


# Encounter Vitals
@router.get("/{encounter_id}/vitals", response_model=List[VitalResponse])
def get_encounter_vitals(encounter_id: int, db: Session = Depends(get_db)):
    """Get vitals recorded during encounter"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    vitals = db.query(Vital).filter(Vital.encounter_id == encounter_id).all()
    return vitals


@router.post("/{encounter_id}/vitals", response_model=VitalResponse)
def add_encounter_vital(
    encounter_id: int, 
    vital: VitalCreate, 
    db: Session = Depends(get_db)
):
    """Add vitals to encounter"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    # Calculate BMI if weight and height provided
    bmi = None
    if vital.weight_kg and vital.height_cm:
        height_m = vital.height_cm / 100
        bmi = round(vital.weight_kg / (height_m * height_m), 2)
    
    db_vital = Vital(
        patient_id=encounter.patient_id,
        encounter_id=encounter_id,
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


# SOAP Note helper
@router.get("/{encounter_id}/soap")
def get_soap_note(encounter_id: int, db: Session = Depends(get_db)):
    """Get encounter formatted as SOAP note"""
    encounter = db.query(Encounter).filter(Encounter.id == encounter_id).first()
    if not encounter:
        raise HTTPException(status_code=404, detail="Encounter not found")
    
    # Get latest vitals
    vitals = db.query(Vital).filter(Vital.encounter_id == encounter_id).order_by(Vital.recorded_at.desc()).first()
    
    soap = {
        "subjective": {
            "chief_complaint": encounter.chief_complaint,
            "history_of_present_illness": encounter.history_of_present_illness,
            "review_of_systems": encounter.review_of_systems
        },
        "objective": {
            "vitals": {
                "temperature": vitals.temperature if vitals else None,
                "heart_rate": vitals.heart_rate if vitals else None,
                "blood_pressure": f"{vitals.blood_pressure_systolic}/{vitals.blood_pressure_diastolic}" if vitals and vitals.blood_pressure_systolic else None,
                "respiratory_rate": vitals.respiratory_rate if vitals else None,
                "oxygen_saturation": vitals.oxygen_saturation if vitals else None,
                "weight_kg": vitals.weight_kg if vitals else None,
                "height_cm": vitals.height_cm if vitals else None,
                "bmi": vitals.bmi if vitals else None
            },
            "physical_examination": encounter.physical_examination
        },
        "assessment": {
            "primary_diagnosis": encounter.primary_diagnosis.name if encounter.primary_diagnosis else None,
            "assessment_and_plan": encounter.assessment_and_plan
        },
        "plan": {
            "assessment_and_plan": encounter.assessment_and_plan
        }
    }
    
    return soap


# Recent encounters
@router.get("/recent/{patient_id}")
def get_recent_encounters(
    patient_id: int,
    limit: int = 5,
    db: Session = Depends(get_db)
):
    """Get recent encounters for a patient"""
    encounters = db.query(Encounter).filter(
        Encounter.patient_id == patient_id
    ).options(
        joinedload(Encounter.doctor),
        joinedload(Encounter.primary_diagnosis)
    ).order_by(
        Encounter.encounter_date.desc()
    ).limit(limit).all()
    
    return encounters
