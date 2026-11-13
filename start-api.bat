@echo off
title DNG API Server (Port 3001)
cd /d "C:\Users\tenad\dng-solutions"
echo.
echo ============================================
echo   DNG API SERVER
echo   Port: 3001
echo ============================================
echo.
node api-server.cjs
echo.
echo ============================================
echo   API STOPPED - CHECK ERROR ABOVE
echo ============================================
echo.
pause