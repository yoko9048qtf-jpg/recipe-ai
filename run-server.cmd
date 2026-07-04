@echo off
rem Fridge Recipe App - API server only (Express on 8787)
title Fridge Recipe App - API Server
set "PATH=%ProgramFiles%\nodejs;%PATH%"
cd /d "%~dp0"
call npm --prefix server run dev
echo.
echo Server stopped. Press any key to close.
pause >nul
