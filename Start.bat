:: This file was made by Pokey#1587
@echo off
:: Change to the directory where the batch file is located
cd /d "%~dp0"
echo Fivem Auto-Packer
echo 1. Start
echo 2. Install
echo 3. Clean and Start
echo Select one: 
set /p selection=
if %selection% == 1 goto start
if %selection% == 2 goto install
if %selection% == 3 goto clean
:start
echo Running Packer... 
start powershell -noexit -command "node .\packer.js"
goto end
:clean
echo Cleaning compiled directory...
if exist "compiled" rd /s /q "compiled"
mkdir compiled
goto start
:install
echo Installing Packer Dependencies...
npm i fs
npm i path
:end
