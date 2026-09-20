@echo off
title Maestro degli Impasti
cls
echo ============================================================
echo         MAESTRO DEGLI IMPASTI (La Teoria del Maestro)
echo ============================================================
echo.
echo Avvio del server locale sicuro in corso...
echo Apertura automatica nel browser su http://localhost:8080
echo.
echo Per chiudere l'applicazione in futuro, chiudi questa finestra.
echo ============================================================
echo.

cd /d "%~dp0"

:: Apri il browser all'indirizzo locale dopo 1 secondo
start "" cmd /c "timeout /t 1 /nobreak >nul & start http://localhost:8080"

:: Avvia il server web locale con Python
python -m http.server 8080

pause
