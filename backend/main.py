from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

# Import EMR models to initialize database
from backend.models.emr import init_db

app = FastAPI(
    title="EMR Medical System",
    description="Electronic Medical Record System with Patient Management",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

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

# Import EMR routers
from backend.routes import patients, appointments, encounters, prescriptions, lab_orders

# Include EMR routers
app.include_router(patients.router)
app.include_router(appointments.router)
app.include_router(encounters.router)
app.include_router(prescriptions.router)
app.include_router(lab_orders.router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "2.0.0", "service": "EMR System"}

@app.get("/api/dashboard")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    from backend.models.emr import SessionLocal, Patient, Appointment, Prescription, LabOrder
    from datetime import date
    
    db = SessionLocal()
    try:
        today = date.today()
        
        total_patients = db.query(Patient).count()
        today_appointments = db.query(Appointment).filter(Appointment.appointment_date == today).count()
        pending_labs = db.query(LabOrder).filter(LabOrder.status.in_(["ordered", "in_progress"])).count()
        active_prescriptions = db.query(Prescription).filter(Prescription.status == "active").count()
        
        return {
            "stats": {
                "total_patients": total_patients,
                "today_appointments": today_appointments,
                "pending_lab_orders": pending_labs,
                "active_prescriptions": active_prescriptions
            }
        }
    finally:
        db.close() 