@echo off
echo Starting LexGuard AI Backend...

cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

call .\venv\Scripts\activate

echo Installing dependencies...
pip install -r requirements.txt

echo Starting Server...
uvicorn app.main:app --reload --port 8000

pause