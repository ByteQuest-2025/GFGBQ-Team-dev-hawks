@echo off
cd /d "%~dp0"
echo.
echo Starting Backend Server...
echo.
py -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause

