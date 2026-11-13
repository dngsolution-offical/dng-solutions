@echo off
cd /d "C:\Users\tenad\dng-solutions"
start "" "C:\Users\tenad\dng-solutions\start-api.bat"
timeout /t 2 >nul
start "" "C:\Users\tenad\dng-solutions\start-vite.bat"
echo.
echo 2 windows opened: API (3001) + Vite (3000)
echo.
timeout /t 3 >nul
start "" "http://localhost:3000/ai"