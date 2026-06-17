"""
EMR Lab Orders API Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import datetime, date

from backend.models.emr import (
    get_db, LabOrder, LabResult, Patient, Doctor, Encounter, LabStatus, Priority
)
from backend.schemas.emr import (
    LabOrderCreate, LabOrderResponse, LabOrderUpdate,
    LabResultCreate, LabResultResponse
)

router = APIRouter(prefix="/api/lab-orders", tags=["lab-orders"])


@router.get("/", response_model=List[LabOrderResponse])
def get_lab_orders(
    skip: int = 0,
    limit: int = 100,
    patient_id: Optional[int] = None,
    doctor_id: Optional[int] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    pending_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get lab orders with optional filtering"""
    query = db.query(LabOrder).options(
        joinedload(LabOrder.patient)
    )
    
    if patient_id:
        query = query.filter(LabOrder.patient_id == patient_id)
    
    if doctor_id:
        query = query.filter(LabOrder.doctor_id == doctor_id)
    
    if status:
        query = query.filter(LabOrder.status == status)
    
    if priority:
        query = query.filter(LabOrder.priority == priority)
    
    if pending_only:
        query = query.filter(LabOrder.status.in_(["ordered", "in_progress"]))
    
    orders = query.order_by(LabOrder.order_date.desc()).offset(skip).limit(limit).all()
    return orders


@router.post("/", response_model=LabOrderResponse, status_code=status.HTTP_201_CREATED)
def create_lab_order(lab_order: LabOrderCreate, db: Session = Depends(get_db)):
    """Create a new lab order"""
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == lab_order.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == lab_order.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Verify encounter if provided
    if lab_order.encounter_id:
        encounter = db.query(Encounter).filter(Encounter.id == lab_order.encounter_id).first()
        if not encounter:
            raise HTTPException(status_code=404, detail="Encounter not found")
    
    db_lab_order = LabOrder(**lab_order.dict())
    db.add(db_lab_order)
    db.commit()
    db.refresh(db_lab_order)
    
    # Load relationships
    db_lab_order.patient = patient
    
    return db_lab_order


@router.get("/{lab_order_id}", response_model=LabOrderResponse)
def get_lab_order(lab_order_id: int, db: Session = Depends(get_db)):
    """Get lab order details with results"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).options(
        joinedload(LabOrder.patient)
    ).first()
    
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    # Load results
    lab_order.results = db.query(LabResult).filter(LabResult.order_id == lab_order_id).all()
    
    return lab_order


@router.put("/{lab_order_id}", response_model=LabOrderResponse)
def update_lab_order(
    lab_order_id: int, 
    lab_order_update: LabOrderUpdate, 
    db: Session = Depends(get_db)
):
    """Update lab order"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).first()
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    update_data = lab_order_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lab_order, field, value)
    
    lab_order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lab_order)
    
    # Load relationships
    lab_order.patient = db.query(Patient).filter(Patient.id == lab_order.patient_id).first()
    
    return lab_order


@router.patch("/{lab_order_id}/status")
def update_lab_order_status(
    lab_order_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Update lab order status"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).first()
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    valid_statuses = [s.value for s in LabStatus]
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
    
    lab_order.status = status
    lab_order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lab_order)
    
    return {"message": "Status updated", "status": status}


@router.delete("/{lab_order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lab_order(lab_order_id: int, db: Session = Depends(get_db)):
    """Delete lab order"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).first()
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    db.delete(lab_order)
    db.commit()
    return None


# Lab Results
@router.get("/{lab_order_id}/results", response_model=List[LabResultResponse])
def get_lab_results(lab_order_id: int, db: Session = Depends(get_db)):
    """Get results for a lab order"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).first()
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    results = db.query(LabResult).filter(LabResult.order_id == lab_order_id).all()
    return results


@router.post("/{lab_order_id}/results", response_model=LabResultResponse, status_code=status.HTTP_201_CREATED)
def add_lab_result(
    lab_order_id: int, 
    result: LabResultCreate, 
    db: Session = Depends(get_db)
):
    """Add result to lab order"""
    lab_order = db.query(LabOrder).filter(LabOrder.id == lab_order_id).first()
    if not lab_order:
        raise HTTPException(status_code=404, detail="Lab order not found")
    
    db_result = LabResult(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    
    # Update order status to completed if first result
    if lab_order.status != "completed":
        lab_order.status = "completed"
        lab_order.updated_at = datetime.utcnow()
        db.commit()
    
    return db_result


@router.put("/results/{result_id}", response_model=LabResultResponse)
def update_lab_result(
    result_id: int, 
    result_update: LabResultCreate, 
    db: Session = Depends(get_db)
):
    """Update lab result"""
    result = db.query(LabResult).filter(LabResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Lab result not found")
    
    update_data = result_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(result, field, value)
    
    db.commit()
    db.refresh(result)
    return result


@router.delete("/results/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lab_result(result_id: int, db: Session = Depends(get_db)):
    """Delete lab result"""
    result = db.query(LabResult).filter(LabResult.id == result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Lab result not found")
    
    db.delete(result)
    db.commit()
    return None


# Patient Lab History
@router.get("/patient/{patient_id}/history")
def get_patient_lab_history(
    patient_id: int,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get patient's lab order history"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    orders = db.query(LabOrder).filter(
        LabOrder.patient_id == patient_id
    ).options(
        joinedload(LabOrder.patient)
    ).order_by(
        LabOrder.order_date.desc()
    ).limit(limit).all()
    
    # Load results for each order
    for order in orders:
        order.results = db.query(LabResult).filter(LabResult.order_id == order.id).all()
    
    return orders


@router.get("/patient/{patient_id}/results")
def get_patient_lab_results(
    patient_id: int,
    test_name: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get patient's lab results with filtering"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    query = db.query(LabResult).join(LabOrder).filter(
        LabOrder.patient_id == patient_id
    )
    
    if test_name:
        query = query.filter(LabResult.test_component.ilike(f"%{test_name}%"))
    
    if date_from:
        query = query.filter(LabResult.result_date >= date_from)
    
    if date_to:
        query = query.filter(LabResult.result_date <= date_to)
    
    results = query.order_by(LabResult.result_date.desc()).limit(limit).all()
    return results


# Test Categories
@router.get("/tests/categories")
def get_test_categories(db: Session = Depends(get_db)):
    """Get unique lab test categories"""
    categories = db.query(LabOrder.test_category).distinct().all()
    return [c[0] for c in categories if c[0]]


@router.get("/tests/names")
def get_test_names(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get unique lab test names"""
    query = db.query(LabOrder.test_name).distinct()
    
    if category:
        query = query.filter(LabOrder.test_category == category)
    
    names = query.all()
    return [n[0] for n in names if n[0]]


# Statistics
@router.get("/stats/summary")
def get_lab_stats(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """Get lab order statistics"""
    query = db.query(LabOrder)
    
    if date_from:
        query = query.filter(LabOrder.order_date >= date_from)
    
    if date_to:
        query = query.filter(LabOrder.order_date <= date_to)
    
    total = query.count()
    
    status_counts = {}
    for status in LabStatus:
        count = query.filter(LabOrder.status == status.value).count()
        status_counts[status.value] = count
    
    priority_counts = {}
    for priority in Priority:
        count = query.filter(LabOrder.priority == priority.value).count()
        priority_counts[priority.value] = count
    
    # Test category distribution
    category_counts = {}
    categories = db.query(LabOrder.test_category, db.func.count(LabOrder.id)).group_by(LabOrder.test_category).all()
    for category, count in categories:
        if category:
            category_counts[category] = count
    
    return {
        "total": total,
        "by_status": status_counts,
        "by_priority": priority_counts,
        "by_category": category_counts
    }
