@echo off
title ApexVault Online Banking - Launcher

echo =====================================================================
echo  ApexVault Online Banking Management System Launcher (Windows)
echo =====================================================================
echo.
echo Launching Backend (Spring Boot 3.3.x on port 8080)...
start "ApexVault Backend" cmd /c "%~dp0start-backend.bat"

echo Waiting 5 seconds before launching Frontend...
timeout /t 5 /nobreak >nul

echo Launching Frontend (React 18 + Vite on port 5173)...
start "ApexVault Frontend" cmd /c "%~dp0start-frontend.bat"

echo.
echo =====================================================================
echo  Both services have been initiated in separate terminal windows.
echo  Backend:  http://localhost:8080/api
echo  Frontend: http://localhost:5173
echo =====================================================================
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173

pause
