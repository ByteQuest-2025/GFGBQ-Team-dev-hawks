from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.routers import grievance, admin, auth, metadata, chat

app = FastAPI(title="CivicPulse API", description="AI-driven grievance redressal platform")

# Create tables on startup (non-blocking)
@app.on_event("startup")
async def startup_event():
    try:
        print(f"Using Database URL: {database.SQLALCHEMY_DATABASE_URL}")
        print("Creating database tables...")
        models.Base.metadata.create_all(bind=database.engine)
        print("✅ Database tables ready")
    except Exception as e:
        print(f"⚠️  Warning: Could not create tables: {e}")
        print("   The server will still start, but database operations may fail.")

import os
if not os.path.exists("uploads"):
    os.makedirs("uploads")

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(grievance.router)
app.include_router(admin.router)
app.include_router(metadata.router)
app.include_router(chat.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to CivicPulse API"}
