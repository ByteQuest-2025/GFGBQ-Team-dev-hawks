#!/usr/bin/env python3
"""Test script to diagnose backend startup issues"""
import sys
import traceback

print("=" * 60)
print("Backend Diagnostic Test")
print("=" * 60)
print()

# Test 1: Python version
print("1. Python version:")
print(f"   {sys.version}")
print()

# Test 2: Import dependencies
print("2. Testing imports...")
try:
    import fastapi
    print(f"   ✅ FastAPI: {fastapi.__version__}")
except Exception as e:
    print(f"   ❌ FastAPI: {e}")
    sys.exit(1)

try:
    import uvicorn
    print(f"   ✅ Uvicorn: {uvicorn.__version__}")
except Exception as e:
    print(f"   ❌ Uvicorn: {e}")
    sys.exit(1)

try:
    import sqlalchemy
    print(f"   ✅ SQLAlchemy: {sqlalchemy.__version__}")
except Exception as e:
    print(f"   ❌ SQLAlchemy: {e}")
    sys.exit(1)

try:
    import psycopg2
    print(f"   ✅ psycopg2: Available")
except Exception as e:
    print(f"   ⚠️  psycopg2: {e} (needed for PostgreSQL)")

print()

# Test 3: Environment variables
print("3. Checking environment variables...")
from dotenv import load_dotenv
import os

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL", "NOT SET")
supabase_password = os.getenv("SUPABASE_DB_PASSWORD", "NOT SET")
database_url = os.getenv("DATABASE_URL", "NOT SET")

print(f"   SUPABASE_URL: {'SET' if supabase_url != 'NOT SET' else 'NOT SET'}")
print(f"   SUPABASE_DB_PASSWORD: {'SET' if supabase_password != 'NOT SET' else 'NOT SET'}")
print(f"   DATABASE_URL: {'SET' if database_url != 'NOT SET' else 'NOT SET'}")
print()

# Test 4: Import app modules
print("4. Testing app imports...")
try:
    from app import database
    print("   ✅ Database module imported")
except Exception as e:
    print(f"   ❌ Database module: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from app import models
    print("   ✅ Models module imported")
except Exception as e:
    print(f"   ❌ Models module: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from app.routers import auth
    print("   ✅ Auth router imported")
except Exception as e:
    print(f"   ❌ Auth router: {e}")
    traceback.print_exc()
    sys.exit(1)

try:
    from app import main
    print("   ✅ Main module imported")
except Exception as e:
    print(f"   ❌ Main module: {e}")
    traceback.print_exc()
    sys.exit(1)

print()

# Test 5: Database connection
print("5. Testing database connection...")
try:
    from app.database import engine, SQLALCHEMY_DATABASE_URL
    print(f"   Database URL type: {'PostgreSQL' if SQLALCHEMY_DATABASE_URL.startswith('postgresql') else 'SQLite'}")
    
    # Try to connect
    with engine.connect() as conn:
        print("   ✅ Database connection successful!")
except Exception as e:
    print(f"   ❌ Database connection failed: {e}")
    traceback.print_exc()
    print()
    print("   ⚠️  This might be OK if using SQLite fallback")

print()

# Test 6: Create app
print("6. Testing FastAPI app creation...")
try:
    from app.main import app
    print("   ✅ FastAPI app created successfully!")
except Exception as e:
    print(f"   ❌ Failed to create app: {e}")
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 60)
print("✅ All tests passed! Backend should start successfully.")
print("=" * 60)
print()
print("Try starting with:")
print("  py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")

