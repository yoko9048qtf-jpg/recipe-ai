@echo off
rem Fridge Recipe App - client only (Vite UI on 5173)
title Fridge Recipe App - Client (Vite)
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0"
call npm --prefix client run dev
echo.
echo Client stopped. Press any key to close.
pause >nul
