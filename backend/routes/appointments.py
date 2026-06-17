"""
EMR Appointments API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date, timedelta

from backend.models.emr import (
    get_db, Appointment, Patient, Doctor, AppointmentStatus, Priority
)
from backend.schemas.emr import (
    AppointmentCreate, AppointmentResponse, AppointmentUpdate
)

router = APIRouter(prefix="/api/appointments", tags=["appointments"])


@router.get("/", response_model=List[AppointmentResponse])
def get_appointments(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get appointments with optional filtering"""
    query = db.query(Appointment).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor)
    )
    
    if patient_id:
        query = query.filter(Appointment.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    if date_from:
        query = query.filter(Appointment.appointment_date >= date_from)
    
    if date_to:
        query = query.filter(Appointment.appointment_date <= date_to)
    
    if status:
        query = query.filter(Appointment.status == status)
    
    appointments = query.order_by(Appointment.appointment_date.desc()).offset(skip).limit(limit).all()
    return appointments


@router.get("/today", response_model=List[AppointmentResponse])
def get_today_appointments(
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get today's appointments"""
    today = date.today()
    
    query = db.query(Appointment).filter(
        Appointment.appointment_date == today
    ).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor)
    )
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    appointments = query.order_by(Appointment.appointment_time.asc()).all()
    return appointments


@router.get("/upcoming", response_model=List[AppointmentResponse])
def get_upcoming_appointments(
    days: int = 7,
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get upcoming appointments for the next N days"""
    today = date.today()
    end_date = today + timedelta(days=days)
    
    query = db.query(Appointment).filter(
        Appointment.appointment_date >= today,
        Appointment.appointment_date <= end_date,
        Appointment.status.in_(["scheduled", "confirmed"])
    ).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor)
    )
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    appointments = query.order_by(Appointment.appointment_date.asc()).all()
    return appointments


@router.post("/", response_model=AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """Create a new appointment"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    db_appointment = Appointment(**appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Load relationships
    db_appointment.patient = patient
    db_appointment.doctor = doctor
    
    return db_appointment


@router.get("/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Get appointment details"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor)
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    return appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int, 
    appointment_update: AppointmentUpdate, 
    db: Session = Depends(get_db)
):
    """Update appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(appointment, field, value)
    
    appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(appointment)
    
    # Load relationships
    appointment.patient = db.query(Patient).filter(Patient.id == appointment.patient_id).first()
    appointment.doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    
    return appointment


@router.patch("/{appointment_id}/status")
def update_appointment_status(
    appointment_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update appointment status"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if status not in [s.value for s in AppointmentStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    appointment.status = status
    appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(appointment)
    
    return {"message": "Status updated", "status": status}


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment(appointment_id: int, db: Session = Depends(get_db)):
    """Delete appointment"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(appointment)
    db.commit()
    return None


# Calendar view
@router.get("/calendar/{year}/{month}")
def get_calendar_view(
    year: int,
    month: int,
    doctor_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get appointments for calendar view"""
    from calendar import monthrange
    
    _, last_day = monthrange(year, month)
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    
    query = db.query(Appointment).filter(
        Appointment.appointment_date >= start_date,
        Appointment.appointment_date <= end_date
    ).options(
        joinedload(Appointment.patient),
        joinedload(Appointment.doctor)
    )
    
    if doctor_id:
        query = query.filter(Appointment.doctor_id == doctor_id)
    
    appointments = query.all()
    
    # Group by date
    calendar_data = {}
    for appt in appointments:
        date_str = appt.appointment_date.isoformat()
        if date_str not in calendar_data:
            calendar_data[date_str] = []
        calendar_data[date_str].append({
            "id": appt.id,
            "time": appt.appointment_time,
            "patient_name": f"{appt.patient.first_name} {appt.patient.last_name}" if appt.patient else "Unknown",
            "type": appt.type,
            "status": appt.status,
            "priority": appt.priority
        })
    
    return calendar_data


# Statistics
@router.get("/stats/summary")
def get_appointment_stats(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get appointment statistics"""
    if not date_from:
        date_from = date.today() - timedelta(days=30)
    if not date_to:
        date_to = date.today()
    
    query = db.query(Appointment).filter(
        Appointment.appointment_date >= date_from,
        Appointment.appointment_date <= date_to
    )
    
    total = query.count()
    
    status_counts = {}
    for status in AppointmentStatus:
        count = query.filter(Appointment.status == status.value).count()
        status_counts[status.value] = count
    
    priority_counts = {}
    for priority in Priority:
        count = query.filter(Appointment.priority == priority.value).count()
        priority_counts[priority.value] = count
    
    return {
        "date_range": {"from": date_from.isoformat(), "to": date_to.isoformat()},
        "total": total,
        "by_status": status_counts,
        "by_priority": priority_counts
    }
