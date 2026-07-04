@echo off
rem Fridge Recipe App - start dev servers (API + UI)
title Fridge Recipe App - Server (close this window to stop)
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0"
echo ============================================
echo  Fridge Recipe App - starting server...
echo  Close this window to STOP the app.
echo ============================================
echo.
call npm run dev
echo.
echo Server stopped. Press any key to close.
pause >nul
