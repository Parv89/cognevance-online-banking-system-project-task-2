@echo off
title ApexVault Online Banking - Frontend Client

echo =====================================================================
echo  Starting ApexVault Online Banking Frontend (React 18 + Vite)
echo =====================================================================

cd /d "%~dp0frontend"

:: Verify Node.js installation
where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in your system PATH.
    echo Please install Node.js 18+ and try again.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
)

echo [INFO] Launching Vite development server...
echo [INFO] Frontend URL: http://localhost:5173
echo.

call npm run dev

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to start frontend dev server.
    pause
)
