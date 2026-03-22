@echo off
REM === Estacion Meteorologica — Kiosk Mode para HP G4-2265LA ===
REM Abre Chrome en modo kiosk (fullscreen sin barra) con low-perf activado.
REM Copiar este archivo al Escritorio o a la carpeta de Inicio de Windows 7:
REM   %APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\
REM para que arranque automaticamente al encender la HP.

REM Esperar 10 segundos para que la red se conecte al bootear
timeout /t 10 /nobreak >nul

REM Intentar encontrar Chrome en ubicaciones comunes
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
) else if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (
    set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"
)

if "%CHROME%"=="" (
    echo Chrome no encontrado. Instalalo primero.
    pause
    exit /b 1
)

REM Arrancar en kiosk mode con la cara HP y low-perf
start "" "%CHROME%" --kiosk --start-fullscreen --disable-infobars --noerrdialogs --disable-translate --no-first-run "https://aisamiter.github.io/estacion-meteorologica/?perf=low&face=hp"
