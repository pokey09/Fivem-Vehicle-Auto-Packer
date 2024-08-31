:: This file was made by Pokey#1587
@echo off
echo Fivem Auto-Packer
echo 1. Start
echo 2. Install
echo Select one: 
set /p selection=
if %selection% == 1 goto start
if %selection% == 2 goto install
:start
echo Running Packer... 
start powershell -noexit -command "node packer.js"
goto end
:install
echo Installing Packer Dependencies...
npm i
:end
