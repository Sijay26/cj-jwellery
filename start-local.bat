@echo off
title Sri Jayam Jewellers - Local Server Launcher
echo =========================================================
echo    SRI JAYAM JEWELLERS - LUXURY E-COMMERCE SERVER
echo =========================================================
echo.
echo Starting Flask Backend with XAMPP MySQL Support...
echo.

if not exist ".venv\Scripts\python.exe" (
    echo Python virtual environment not found. Please ensure Python is installed.
    pause
    exit /b
)

start "" http://127.0.0.1:5000
.venv\Scripts\python.exe run.py

pause
