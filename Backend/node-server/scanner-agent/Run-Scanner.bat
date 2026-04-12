@echo off
title SchedSim PC Scanner Agent
color 0B
echo.
echo  ====================================================
echo   SchedSim PC Scanner - Launching...
echo  ====================================================
echo.
echo  This will scan your running processes and send them
echo  to SchedSim for CPU scheduling analysis.
echo.
echo  Make sure SchedSim is running at http://localhost:3000
echo.
pause

powershell -ExecutionPolicy Bypass -File "%~dp0SchedSim-Scanner.ps1"
