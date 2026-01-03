# How to Start the Backend Server

The backend server needs to be running for the signup functionality to work.

## Quick Start

1. **Open a new terminal/command prompt**
2. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

3. **Start the server:**
   ```bash
   py -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   
   Or on Windows, you can double-click `START_BACKEND.bat` in the project root.

4. **Wait for the message:**
   ```
   Uvicorn running on http://0.0.0.0:8000
   ```

5. **Verify it's running:**
   - Open http://localhost:8000 in your browser
   - You should see: `{"message": "Welcome to CivicPulse API"}`
   - Or check http://localhost:8000/docs for the API documentation

## Troubleshooting

**If you get "Python not found":**
- Python needs to be installed and in your PATH
- Restart your terminal after installing Python

**If you get "Module not found":**
- Install dependencies: `py -m pip install -r requirements.txt`

**If port 8000 is already in use:**
- Change the port: `py -m uvicorn main:app --reload --port 8001`
- Update frontend `lib/api.ts` to use the new port

## Status Check

Once running, you should see:
- ✅ Backend: http://localhost:8000
- ✅ Frontend: http://localhost:3000
- ✅ API Docs: http://localhost:8000/docs

Both servers need to be running for the application to work properly!

