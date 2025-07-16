from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

app = FastAPI(
    title="Medical Imaging System",
    description="A modern web-based medical imaging system",
    version="1.0.0"
)

# Mount static files
static_path = Path("app/static")
static_path.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=static_path), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")

@app.get("/")
async def root(request: Request):
    """Root endpoint that shows the main page"""
    return templates.TemplateResponse("index.html", {"request": request})

# Import routers
# from app.api import auth, clinics, images

# Include routers
# app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
# app.include_router(clinics.router, prefix="/clinics", tags=["Clinics"])
# app.include_router(images.router, prefix="/images", tags=["Images"]) 