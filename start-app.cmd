@echo off
rem Fridge Recipe App launcher: start servers, then open the browser
cd /d "%~dp0"

echo Starting Fridge Recipe App...
echo.

rem Start the dev servers in a separate window (keeps running)
start "Fridge Recipe App - Server" "%~dp0run-dev.cmd"

echo Waiting for the app to be ready (first launch may take a while)...

set /a tries=0
:wait
set /a tries+=1
powershell -NoProfile -Command "try{(Invoke-WebRequest http://localhost:5173 -UseBasicParsing -TimeoutSec 2)|Out-Null;exit 0}catch{exit 1}"
if not errorlevel 1 goto ready
if %tries% GEQ 60 goto timeout
timeout /t 2 /nobreak >nul
goto wait

:ready
echo Ready. Opening browser...
start "" http://localhost:5173
exit /b 0

:timeout
echo.
echo Timed out waiting for the app to start.
echo Please check the server window for errors.
echo If it looks OK, open http://localhost:5173 in your browser.
echo.
pause
exit /b 1
