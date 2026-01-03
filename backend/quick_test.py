"""Quick test to verify server can start"""
print("Testing imports...")
try:
    from app.main import app
    print("✅ App imported successfully!")
    print("✅ Server should start without errors")
    print("\nYou can now run: py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

