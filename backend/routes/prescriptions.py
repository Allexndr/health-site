"""
EMR Prescriptions API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date

from backend.models.emr import (
    get_db, Prescription, Patient, Doctor, Medication, Encounter, PrescriptionStatus
)
from backend.schemas.emr import (
    PrescriptionCreate, PrescriptionResponse, PrescriptionUpdate
)

router = APIRouter(prefix="/api/prescriptions", tags=["prescriptions"])


@router.get("/", response_model=List[PrescriptionResponse])
def get_prescriptions(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    medication_id: Optional[int] = None,
    status: Optional[str] = None,
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get prescriptions with optional filtering"""
    query = db.query(Prescription).options(
        joinedload(Prescription.patient),
        joinedload(Prescription.doctor),
        joinedload(Prescription.medication)
    )
    
    if patient_id:
        query = query.filter(Prescription.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)
    
    if medication_id:
        query = query.filter(Prescription.medication_id == medication_id)
    
    if status:
        query = query.filter(Prescription.status == status)
    
    if active_only:
        query = query.filter(Prescription.status == PrescriptionStatus.ACTIVE)
    
    prescriptions = query.order_by(Prescription.prescribed_date.desc()).offset(skip).limit(limit).all()
    return prescriptions


@router.post("/", response_model=PrescriptionResponse, status_code=status.HTTP_201_CREATED)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    """Create a new prescription"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == prescription.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == prescription.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Verify medication exists
    medication = db.query(Medication).filter(Medication.id == prescription.medication_id).first()
    if not medication:
        raise HTTPException(status_code=404, detail="Medication not found")
    
    # Verify encounter if provided
    if prescription.encounter_id:
        encounter = db.query(Encounter).filter(Encounter.id == prescription.encounter_id).first()
        if not encounter:
            raise HTTPException(status_code=404, detail="Encounter not found")
    
    db_prescription = Prescription(
        **prescription.dict(),
        refills_remaining=prescription.refills
    )
    db.add(db_prescription)
    db.commit()
    db.refresh(db_prescription)
    
    # Load relationships
    db_prescription.patient = patient
    db_prescription.doctor = doctor
    db_prescription.medication = medication
    
    return db_prescription


@router.get("/{prescription_id}", response_model=PrescriptionResponse)
def get_prescription(prescription_id: int, db: Session = Depends(get_db)):
    """Get prescription details"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).options(
        joinedload(Prescription.patient),
        joinedload(Prescription.doctor),
        joinedload(Prescription.medication)
    ).first()
    
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    return prescription


@router.put("/{prescription_id}", response_model=PrescriptionResponse)
def update_prescription(
    prescription_id: int, 
    prescription_update: PrescriptionUpdate, 
    db: Session = Depends(get_db)
):
    """Update prescription"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    update_data = prescription_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prescription, field, value)
    
    prescription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prescription)
    
    # Load relationships
    prescription.patient = db.query(Patient).filter(Patient.id == prescription.patient_id).first()
    prescription.doctor = db.query(Doctor).filter(Doctor.id == prescription.doctor_id).first()
    prescription.medication = db.query(Medication).filter(Medication.id == prescription.medication_id).first()
    
    return prescription


@router.patch("/{prescription_id}/status")
def update_prescription_status(
    prescription_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update prescription status"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    valid_statuses = [s.value for s in PrescriptionStatus]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    prescription.status = status
    prescription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prescription)
    
    return {"message": "Status updated", "status": status}


@router.post("/{prescription_id}/refill")
def refill_prescription(
    prescription_id: int,
    db: Session = Depends(get_db)
):
    """Process prescription refill"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    if prescription.refills_remaining <= 0:
        raise HTTPException(status_code=400, detail="No refills remaining")
    
    prescription.refills_remaining -= 1
    prescription.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(prescription)
    
    return {
        "message": "Refill processed",
        "refills_remaining": prescription.refills_remaining
    }


@router.delete("/{prescription_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prescription(prescription_id: int, db: Session = Depends(get_db)):
    """Delete prescription"""
    prescription = db.query(Prescription).filter(Prescription.id == prescription_id).first()
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    
    db.delete(prescription)
    db.commit()
    return None


# Patient's current medications
@router.get("/patient/{patient_id}/current")
def get_current_medications(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Get patient's current active medications"""
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id,
        Prescription.status == PrescriptionStatus.ACTIVE
    ).options(
        joinedload(Prescription.medication),
        joinedload(Prescription.doctor)
    ).all()
    
    return prescriptions


# Prescription history
@router.get("/patient/{patient_id}/history")
def get_prescription_history(
    patient_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get patient's prescription history"""
    prescriptions = db.query(Prescription).filter(
        Prescription.patient_id == patient_id
    ).options(
        joinedload(Prescription.medication),
        joinedload(Prescription.doctor)
    ).order_by(
        Prescription.prescribed_date.desc()
    ).limit(limit).all()
    
    return prescriptions


# Medications catalog
@router.get("/medications/catalog")
def get_medications_catalog(
    search: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get medications catalog"""
    query = db.query(Medication)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Medication.name.ilike(search_filter)) |
            (Medication.generic_name.ilike(search_filter)) |
            (Medication.brand_name.ilike(search_filter))
        )
    
    if category:
        query = query.filter(Medication.category == category)
    
    medications = query.offset(skip).limit(limit).all()
    return medications


@router.post("/medications/catalog", status_code=status.HTTP_201_CREATED)
def add_medication_to_catalog(medication_data: dict, db: Session = Depends(get_db)):
    """Add medication to catalog"""
    medication = Medication(**medication_data)
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


# Statistics
@router.get("/stats/summary")
def get_prescription_stats(
    doctor_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get prescription statistics"""
    query = db.query(Prescription)
    
    if doctor_id:
        query = query.filter(Prescription.doctor_id == doctor_id)
    
    if date_from:
        query = query.filter(Prescription.prescribed_date >= date_from)
    
    if date_to:
        query = query.filter(Prescription.prescribed_date <= date_to)
    
    total = query.count()
    active = query.filter(Prescription.status == PrescriptionStatus.ACTIVE).count()
    completed = query.filter(Prescription.status == PrescriptionStatus.COMPLETED).count()
    cancelled = query.filter(Prescription.status == PrescriptionStatus.CANCELLED).count()
    
    return {
        "total": total,
        "active": active,
        "completed": completed,
        "cancelled": cancelled
    }
