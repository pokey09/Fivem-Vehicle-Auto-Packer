:: This file was made by Pokey#1587
@echo off
cd /d "%~dp0"

:menu
echo Fivem Auto-Packer
echo ==================
echo 1. Start
echo 2. Install
echo 3. Clean and Start
echo ==================
set /p selection=Select one: 

if "%selection%"=="1" goto start
if "%selection%"=="2" goto install
if "%selection%"=="3" goto clean
goto menu

:: ---------------- Check Node Installed ----------------
:checknode
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found!
    echo Installing Node.js...
    start https://nodejs.org/dist/latest/node-v20.11.1-x64.msi
    echo Please install Node.js, then press any key to continue...
    pause >nul
)
exit /b

:: ---------------- Start Packer ----------------
:start
call :checknode
echo Running Packer...
start powershell -noexit -command "node .\packer.js"
goto end

:: ---------------- Clean and Rebuild ----------------
:clean
echo Cleaning compiled directory...
if exist "compiled" rd /s /q "compiled"
mkdir compiled
goto start

:: ---------------- Install Dependencies ----------------
:install
call :checknode
echo Installing Packer Dependencies...
npm install
goto end

:end
pause
