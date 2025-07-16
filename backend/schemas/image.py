from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class ImageBase(BaseModel):
    filename: str
    mime_type: str
    clinic_id: int

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    file_path: str
    uploaded_by: int
    created_at: datetime

    class Config:
        from_attributes = True

class ImageMetadata(BaseModel):
    width: Optional[int] = None
    height: Optional[int] = None
    modality: Optional[str] = None  # Для DICOM
    patient_id: Optional[str] = None  # Для DICOM
    study_date: Optional[datetime] = None  # Для DICOM
    series_number: Optional[int] = None  # Для DICOM
    instance_number: Optional[int] = None  # Для DICOM

class ImageWithMetadata(Image):
    metadata: Optional[ImageMetadata] = None

    class Config:
        from_attributes = True 