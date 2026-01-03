@echo off
cd /d "%~dp0"
echo.
echo ============================================
echo   Starting Backend Server (Simple Mode)
echo ============================================
echo.
echo This will use SQLite database (no setup needed)
echo.
echo Starting server on http://127.0.0.1:8000
echo.
py -m uvicorn main:app --host 127.0.0.1 --port 8000
pause

