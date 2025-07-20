import cloudinary
import cloudinary.uploader

cloudinary.config(
    cloud_name='dm9fwh2oq',
    api_key='249697995531769',
    api_secret='mlKR2w-Hc1G_e5s-XAP88ZUh2zQ'
)

def upload_image_to_cloudinary(file):
    # file: UploadFile (FastAPI)
    result = cloudinary.uploader.upload(file.file, resource_type="image")
    return result['secure_url'] 