#!/bin/bash
# Backend startup script

# Try to find Python
PYTHON_CMD=""
for path in "/c/Users/$USER/AppData/Local/Programs/Python/Python312/python.exe" \
            "/c/Program Files/Python312/python.exe" \
            "/c/Program Files (x86)/Python312/python.exe"; do
    if [ -f "$path" ]; then
        PYTHON_CMD="$path"
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    # Try python command
    if command -v python >/dev/null 2>&1; then
        PYTHON_CMD="python"
    elif command -v python3 >/dev/null 2>&1; then
        PYTHON_CMD="python3"
    else
        echo "Python not found. Please install Python and try again."
        exit 1
    fi
fi

cd backend
echo "Using Python: $PYTHON_CMD"
echo "Installing dependencies..."
$PYTHON_CMD -m pip install -r requirements.txt
echo "Starting backend server..."
$PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
