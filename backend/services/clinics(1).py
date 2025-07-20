from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.base import Clinic, ClinicUser, User
from app.schemas.clinic import ClinicCreate, ClinicUserCreate
from app.db.mongo import db
from passlib.hash import bcrypt
from bson import ObjectId

def get_clinic(db: Session, clinic_id: int) -> Optional[Clinic]:
    """Получает клинику по ID"""
    return db.query(Clinic).filter(Clinic.id == clinic_id).first()

def get_clinics(db: Session, skip: int = 0, limit: int = 100) -> List[Clinic]:
    """Получает список клиник"""
    return db.query(Clinic).offset(skip).limit(limit).all()

def create_clinic(data):
    password_hash = bcrypt.hash(data["password"])
    clinic = {
        "name": data["name"],
        "login": data["login"],
        "password_hash": password_hash,
    }
    result = db.clinics.insert_one(clinic)
    return str(result.inserted_id)

def get_clinic_by_login(login):
    return db.clinics.find_one({"login": login})

def get_clinic_by_id(clinic_id):
    return db.clinics.find_one({"_id": ObjectId(clinic_id)})

def add_user_to_clinic(db: Session, clinic_user: ClinicUserCreate) -> ClinicUser:
    """Добавляет пользователя в клинику"""
    db_clinic_user = ClinicUser(**clinic_user.model_dump())
    db.add(db_clinic_user)
    db.commit()
    db.refresh(db_clinic_user)
    return db_clinic_user

def get_clinic_users(db: Session, clinic_id: int) -> List[ClinicUser]:
    """Получает список пользователей клиники"""
    return db.query(ClinicUser).filter(ClinicUser.clinic_id == clinic_id).all()

def get_user_clinics(db: Session, user_id: int) -> List[ClinicUser]:
    """Получает список клиник пользователя"""
    return db.query(ClinicUser).filter(ClinicUser.user_id == user_id).all()

def is_clinic_admin(db: Session, user_id: int, clinic_id: int) -> bool:
    """Проверяет, является ли пользователь администратором клиники"""
    clinic_user = db.query(ClinicUser).filter(
        ClinicUser.user_id == user_id,
        ClinicUser.clinic_id == clinic_id,
        ClinicUser.role == "admin"
    ).first()
    return clinic_user is not None 

def authenticate_clinic(login: str, password: str):
    clinic = get_clinic_by_login(login)
    if not clinic:
        return None
    if not bcrypt.verify(password, clinic["password_hash"]):
        return None
    return clinic 