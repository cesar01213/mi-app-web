@echo off
title Tambo Manager Launcher
color 0A
echo ==========================================
echo      INICIANDO TAMBO MANAGER APP
echo ==========================================
echo.
echo Limpiando procesos previos...
:: Mata cualquier proceso en el puerto 3000 (Node/Next)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a >nul 2>&1

echo Cargando sistema...
cd tambo-app

echo.
echo 1. Iniciando servidor web...
echo.
echo 2. El navegador se abrira automaticamente...
echo.
echo ==========================================
echo NOTA: No cierres esta ventana negra.
echo ==========================================
echo.

:: Abre el navegador despues de 8 segundos
timeout /t 8 >nul
start http://localhost:3000

:: Inicia el servidor
cmd /c "npm run dev"
pause
