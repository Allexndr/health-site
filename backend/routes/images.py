from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.routes.auth import get_current_user, get_db, get_current_clinic
from app.services import images as images_service
from app.services import clinics as clinics_service
from app.schemas.image import Image, ImageCreate, ImageWithMetadata
from app.schemas.auth import User
from app.services.cloudinary_images import upload_image_to_cloudinary

router = APIRouter()

@router.post("/upload", response_model=Image)
async def upload_image(
    file: UploadFile = File(...),
    clinic_id: int = None,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Загружает новое изображение"""
    if not clinic_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Clinic ID is required"
        )
    
    # Проверяем, что пользователь имеет доступ к клинике
    clinic = clinics_service.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    # Создаем запись изображения
    image_create = ImageCreate(
        filename=file.filename,
        mime_type=file.content_type,
        clinic_id=clinic_id
    )
    
    return images_service.create_image(db, file, image_create, current_user.id)

@router.post("/cloudinary/upload")
async def upload_image_cloudinary(file: UploadFile = File(...), current_user: dict = Depends(get_current_clinic)):
    url = upload_image_to_cloudinary(file)
    return {"url": url}

@router.get("/clinic/{clinic_id}", response_model=List[Image])
async def read_clinic_images(
    clinic_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает список изображений клиники"""
    clinic = clinics_service.get_clinic(db, clinic_id)
    if not clinic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Clinic not found"
        )
    
    return images_service.get_clinic_images(db, clinic_id, skip, limit)

@router.get("/{image_id}", response_model=ImageWithMetadata)
async def read_image(
    image_id: int,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Получает информацию об изображении"""
    image = images_service.get_image(db, image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Получаем метаданные
    metadata = images_service.get_image_metadata(image.file_path, image.mime_type)
    
    return ImageWithMetadata(
        **image.__dict__,
        metadata=metadata
    )

@router.get("/{image_id}/download")
async def download_image(
    image_id: int,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Скачивает изображение"""
    image = images_service.get_image(db, image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    return FileResponse(
        image.file_path,
        media_type=image.mime_type,
        filename=image.filename
    )

@router.delete("/{image_id}")
async def delete_image(
    image_id: int,
    current_user: dict = Depends(get_current_clinic),
    db: Session = Depends(get_db)
):
    """Удаляет изображение"""
    image = images_service.get_image(db, image_id)
    if not image:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Image not found"
        )
    
    # Проверяем права (только администратор клиники или загрузивший может удалить)
    if not (
        clinics_service.is_clinic_admin(db, current_user.id, image.clinic_id) or
        image.uploaded_by == current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    images_service.delete_image(db, image)
    return {"status": "success"} 