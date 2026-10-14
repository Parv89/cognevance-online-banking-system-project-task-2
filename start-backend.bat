@echo off
setlocal enabledelayedexpansion
title ApexVault Online Banking - Backend Service

echo =====================================================================
echo  Starting ApexVault Online Banking Backend (Spring Boot 3.3.x)
echo =====================================================================

:: Determine project root and backend directory
set "CURRENT_DIR=%~dp0"
if exist "%CURRENT_DIR%backend" (
    set "BACKEND_DIR=%CURRENT_DIR%backend"
    set "ROOT_DIR=%CURRENT_DIR%"
) else (
    set "BACKEND_DIR=%CURRENT_DIR%"
    set "ROOT_DIR=%CURRENT_DIR%..\"
)

:: Verify Java 17 installation
where java >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Java is not installed or not available in PATH.
    echo Please install Java 17 (e.g. Eclipse Adoptium Temurin 17) and try again.
    pause
    exit /b 1
)

:: Locate and parse .env file safely
set "ENV_FILE=%ROOT_DIR%.env"
if not exist "%ENV_FILE%" set "ENV_FILE=%BACKEND_DIR%\.env"

if exist "%ENV_FILE%" (
    echo [INFO] Loading environment configuration from: %ENV_FILE%
    for /f "usebackq tokens=1,* delims==" %%A in ("%ENV_FILE%") do (
        set "KEY=%%A"
        set "VAL=%%B"
        if defined KEY (
            if not "!KEY:~0,1!"=="#" (
                if defined VAL (
                    set "!KEY!=!VAL!"
                )
            )
        )
    )
) else (
    echo [INFO] No .env file detected. Using environment variables and defaults.
)

:: Set default connection parameters if not specified
if not defined DB_USERNAME set "DB_USERNAME=root"
if not defined DB_NAME set "DB_NAME=bank_db"
if not defined DB_HOST set "DB_HOST=localhost"
if not defined DB_PORT set "DB_PORT=3306"

:: Treat placeholder password as unset
if "!DB_PASSWORD!"=="your_mysql_password_here" (
    set "DB_PASSWORD="
)

:: Securely prompt for password if not set in environment or .env
if not defined DB_PASSWORD (
    echo.
    echo [PROMPT] MySQL password for user '!DB_USERNAME!' is required.
    echo Keystrokes will be masked for security.
    for /f "delims=" %%P in ('powershell -NoProfile -Command "$pwd = Read-Host -Prompt 'Enter MySQL password' -AsSecureString; [System.Net.NetworkCredential]::new('', $pwd).Password"') do (
        set "DB_PASSWORD=%%P"
    )
    echo.
)

:: Export Spring-standard and custom environment variables to child process
set "SPRING_DATASOURCE_USERNAME=!DB_USERNAME!"
set "SPRING_DATASOURCE_PASSWORD=!DB_PASSWORD!"
if not defined DB_URL (
    set "DB_URL=jdbc:mysql://!DB_HOST!:!DB_PORT!/!DB_NAME!?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
)
set "SPRING_DATASOURCE_URL=!DB_URL!"

:: Print non-sensitive startup details (Password is NEVER printed)
echo [INFO] Target Database: !DB_HOST!:!DB_PORT!/!DB_NAME!
echo [INFO] Database User:   !DB_USERNAME!
if defined DB_PASSWORD (
    echo [INFO] Database Pass:   [CONFIGURED]
) else (
    echo [WARN] Database Pass:   [EMPTY]
)
echo [INFO] Backend Endpoint: http://localhost:8080/api
echo.

cd /d "%BACKEND_DIR%"
call mvnw.cmd spring-boot:run

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Backend terminated with exit code %ERRORLEVEL%.
    echo Please verify that MySQL 8 is running and password is correct.
    pause
)
