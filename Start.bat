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
start powershell -noexit -command "cd ./packer_data; node ."
goto end
:install
start powershell -command "cd ./packer_data; npm i"
echo Installing Packer Dependencies...
:end
