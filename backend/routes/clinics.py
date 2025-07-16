from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routes.auth import get_current_clinic
from app.services import clinics as clinics_service
from app.schemas.clinic import Clinic, ClinicCreate, ClinicUser, ClinicUserCreate, ClinicWithUsers
from app.schemas.auth import User

router = APIRouter()

@router.post("/", response_model=Clinic)
async def create_clinic(
    clinic: ClinicCreate,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Создает новую клинику и делает текущего пользователя её администратором"""
    # Создаем клинику
    db_clinic = clinics_service.create_clinic(db, clinic)
    
    # Добавляем создателя как администратора
    clinic_user = ClinicUserCreate(
        user_id=current_user.id,
        clinic_id=db_clinic.id,
        role="admin"
    )
    clinics_service.add_user_to_clinic(db, clinic_user)
    
    return db_clinic

@router.get("/", response_model=List[Clinic])
async def read_clinics(
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает список клиник"""
    clinics = clinics_service.get_clinics(db, skip=skip, limit=limit)
    return clinics

@router.get("/{clinic_id}", response_model=ClinicWithUsers)
async def read_clinic(
    clinic_id: int,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает информацию о клинике"""
    clinic = clinics_service.get_clinic(db, clinic_id)
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinic

@router.post("/{clinic_id}/users", response_model=ClinicUser)
async def add_clinic_user(
    clinic_id: int,
    clinic_user: ClinicUserCreate,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Добавляет пользователя в клинику"""
    # Проверяем, что текущий пользователь является администратором клиники
    if not clinics_service.is_clinic_admin(db, current_user.id, clinic_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return clinics_service.add_user_to_clinic(db, clinic_user)

@router.get("/{clinic_id}/users", response_model=List[ClinicUser])
async def read_clinic_users(
    clinic_id: int,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает список пользователей клиники"""
    clinic = clinics_service.get_clinic(db, clinic_id)
    if clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return clinics_service.get_clinic_users(db, clinic_id)

@router.get("/users/me/clinics", response_model=List[ClinicUser])
async def read_user_clinics(
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает список клиник текущего пользователя"""
    return clinics_service.get_user_clinics(db, current_user.id) 