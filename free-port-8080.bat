@echo off
echo ========================================================
echo Checking and freeing port 8080...
echo ========================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo Terminating process PID: %%a listening on port 8080...
    taskkill /F /PID %%a
)

echo Port 8080 is now free and ready.
pause
