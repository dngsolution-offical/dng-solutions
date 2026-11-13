@echo off
title DNG Launcher
cd /d "C:\Users\tenad\dng-solutions"

echo Cleaning old processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 >nul

echo Starting Backend (Port 3001)...
start cmd /k "title DNG Backend && node api-server.cjs"

echo Starting Frontend (Port 3000)...
start cmd /k "title DNG Frontend && npx vite --port 3000"

echo Waiting for servers to boot...
timeout /t 5 >nul

echo Opening Browser...
start http://localhost:3000/ai