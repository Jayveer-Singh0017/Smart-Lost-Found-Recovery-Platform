@echo off
echo ========================================================
echo Starting Smart Lost and Found Backend (Port 8080)
echo ========================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Freeing existing process on port 8080 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)

cd backend
echo Starting Spring Boot with Maven...
mvn spring-boot:run
pause
