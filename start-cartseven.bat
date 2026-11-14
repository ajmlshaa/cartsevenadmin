@echo off
title CartSeven - E-Commerce Multi-Location Accounting Platform
color 0A

echo ========================================================================
echo                         CARTSEVEN
echo        E-Commerce Multi-Location Accounting & Finance Platform
echo ========================================================================
echo.
echo [1/3] Preparing workspace...
cd /d "%~dp0"

echo [2/3] Launching Backend API on port 5000...
start "CartSeven Backend" cmd /c "cd /d "%~dp0server" && npm.cmd run dev"

echo [3/3] Launching Frontend UI on port 5173...
start "CartSeven Frontend" cmd /c "cd /d "%~dp0client" && npm.cmd run dev"

timeout /t 3 >nul
start http://localhost:5173

echo.
echo ========================================================================
echo CartSeven is running!
echo Access the web app at: http://localhost:5173
echo.
echo 3 Pre-configured Location Users Ready for Testing:
echo   1. Admin:      admin@cartseven.com      (HQ - New York)
echo   2. Accountant: accountant@cartseven.com (Finance Hub - London)
echo   3. Manager:    manager@cartseven.com    (Operations - Dubai)
echo   Password:      password123 (or use 1-click test login in UI)
echo ========================================================================
echo.
echo Press any key to stop this window (servers will continue in background)...
pause >nul
