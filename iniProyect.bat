@echo off
chcp 65001 >nul
title Iniciador Automático - Ciompi app.js
color 0A
mode con: cols=80 lines=25

echo ========================================
echo    INICIADOR AUTOMÁTICO DE APLICACIÓN
echo ========================================
echo.
pause

:CHECK_ADMIN
echo Verificando permisos de administrador...
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Ejecutando como administrador...
    powershell -Command "Start-Process cmd -ArgumentList '/c %~dp0%~nx0' -Verb RunAs"
    exit /b
)

:CHECK_NODE
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no está instalado
    echo Instala Node.js desde: https://nodejs.org
    timeout /t 10
    exit /b 1
)
echo ✓ Node.js encontrado

:CHECK_MONGO
echo [2/5] Verificando MongoDB...
sc query MongoDB >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MongoDB está instalado como servicio
    goto START_MONGO
)

echo ℹ MongoDB no encontrado como servicio
echo ℹ Asumiendo que usas MongoDB Atlas o servidor remoto
goto CHECK_PROJECT

:START_MONGO
echo [3/5] Iniciando MongoDB...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ No se pudo iniciar MongoDB
    echo ℹ Continuando con MongoDB remoto...
)
echo ✓ MongoDB listo

:CHECK_PROJECT
echo [4/5] Verificando proyecto...
cd /d "%~dp0"

if not exist package.json (
    echo ✗ No se encuentra package.json
    pause
    exit /b 1
)
echo ✓ Proyecto encontrado

:START_SERVER
echo.
echo ========================================
echo    APLICACIÓN INICIANDO...
echo ========================================
echo URL: http://localhost:3000
echo MongoDB: 27017 (local) o Atlas
echo ========================================
echo.
echo La aplicación se abrirá automáticamente...
timeout /t 3 >nul

start "" "http://localhost:3000/ciompi"

echo Iniciando servidor Next.js...
pnpm start

pause