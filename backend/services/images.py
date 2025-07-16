import os
import shutil
from typing import List, Optional
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
import pydicom
from PIL import Image as PILImage

from app.models.base import Image
from app.schemas.image import ImageCreate, ImageMetadata

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: str) -> None:
    """Сохраняет загруженный файл"""
    try:
        with open(destination, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

def get_image_metadata(file_path: str, mime_type: str) -> Optional[ImageMetadata]:
    """Извлекает метаданные из изображения"""
    try:
        if mime_type == "application/dicom":
            # Читаем DICOM файл
            ds = pydicom.dcmread(file_path)
            return ImageMetadata(
                modality=getattr(ds, "Modality", None),
                patient_id=getattr(ds, "PatientID", None),
                study_date=getattr(ds, "StudyDate", None),
                series_number=getattr(ds, "SeriesNumber", None),
                instance_number=getattr(ds, "InstanceNumber", None)
            )
        else:
            # Читаем обычное изображение
            with PILImage.open(file_path) as img:
                return ImageMetadata(
                    width=img.width,
                    height=img.height
                )
    except Exception:
        return None

def create_image(
    db: Session,
    file: UploadFile,
    image: ImageCreate,
    user_id: int
) -> Image:
    """Создает новую запись изображения"""
    # Генерируем путь для файла
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file_path = os.path.join(UPLOAD_DIR, f"{timestamp}_{image.filename}")
    
    # Сохраняем файл
    save_upload_file(file, file_path)
    
    # Создаем запись в БД
    db_image = Image(
        filename=image.filename,
        file_path=file_path,
        mime_type=image.mime_type,
        clinic_id=image.clinic_id,
        uploaded_by=user_id
    )
    
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

def get_image(db: Session, image_id: int) -> Optional[Image]:
    """Получает изображение по ID"""
    return db.query(Image).filter(Image.id == image_id).first()

def get_clinic_images(
    db: Session,
    clinic_id: int,
    skip: int = 0,
    limit: int = 100
) -> List[Image]:
    """Получает список изображений клиники"""
    return db.query(Image)\
        .filter(Image.clinic_id == clinic_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def delete_image(db: Session, image: Image) -> None:
    """Удаляет изображение"""
    # Удаляем файл
    if os.path.exists(image.file_path):
        os.remove(image.file_path)
    
    # Удаляем запись из БД
    db.delete(image)
    db.commit() 