from datetime import datetime
from pydantic import BaseModel, Field
from typing import List, Optional
from .auth import User

class ClinicBase(BaseModel):
    name: str
    address: str

class ClinicCreate(BaseModel):
    name: str
    login: str
    password: str

class ClinicInDB(BaseModel):
    id: str = Field(alias="_id")
    name: str
    login: str
    password_hash: str

class Clinic(ClinicBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ClinicUserBase(BaseModel):
    role: str

class ClinicUserCreate(ClinicUserBase):
    user_id: int
    clinic_id: int

class ClinicUser(ClinicUserBase):
    id: int
    user: User
    clinic: Clinic
    created_at: datetime

    class Config:
        from_attributes = True

class ClinicWithUsers(Clinic):
    users: List[ClinicUser]

    class Config:
        from_attributes = True 