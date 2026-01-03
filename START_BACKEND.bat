@echo off
cd /d "%~dp0backend"
echo.
echo ============================================
echo   Starting CivicPulse Backend Server...
echo ============================================
echo.
echo Starting server...
echo Backend will be available at: http://127.0.0.1:8000
echo API Documentation: http://127.0.0.1:8000/docs
echo.
echo ============================================
echo.
echo If you see errors below, DO NOT CLOSE THIS WINDOW
echo Please share the error messages.
echo.
echo ============================================
echo.

py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000

echo.
echo ============================================
echo Server stopped.
echo ============================================
pause
