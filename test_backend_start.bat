@echo off
cd /d "%~dp0backend"
echo Testing backend startup...
echo.

py -c "from app.main import app; print('✅ App imports successfully')" 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: App failed to import
    echo.
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ All checks passed!
echo.
echo You can now start the server with START_BACKEND.bat
pause

