import os
from urllib.parse import quote_plus
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase connection details
# Option 1: Use direct DATABASE_URL if provided (recommended)
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Option 2: Construct from individual components
if not DATABASE_URL:
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://dtvmcjqvhjntgdqmblor.supabase.co")
    SUPABASE_DB_PASSWORD = os.getenv("SUPABASE_DB_PASSWORD", "")
    
    if SUPABASE_DB_PASSWORD:
        # Supabase connection string format:
        # postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
        # URL-encode password to handle special characters (spaces, etc.)
        encoded_password = quote_plus(SUPABASE_DB_PASSWORD)
        project_ref = "dtvmcjqvhjntgdqmblor"  # Extract from URL
        SQLALCHEMY_DATABASE_URL = f"postgresql://postgres.{project_ref}:{encoded_password}@db.{project_ref}.supabase.co:5432/postgres"
    else:
        # Fallback to SQLite if password not provided
        print("⚠️  Warning: SUPABASE_DB_PASSWORD not set. Using SQLite fallback.")
        print("   To use Supabase, set SUPABASE_DB_PASSWORD in .env file")
        SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
else:
    SQLALCHEMY_DATABASE_URL = DATABASE_URL

# Create engine with appropriate connection args
if SQLALCHEMY_DATABASE_URL.startswith("postgresql"):
    # PostgreSQL connection (Supabase)
    print("✅ Connecting to Supabase PostgreSQL database...")
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=1,  # Reduced pool size
        max_overflow=0,  # No overflow
        echo=False,  # Set to True for SQL query logging
        connect_args={
            "connect_timeout": 5  # 5 second timeout
        },
        pool_recycle=3600  # Recycle connections after 1 hour
    )
else:
    # SQLite connection (fallback or default)
    print("📦 Using SQLite database (local development)")
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
