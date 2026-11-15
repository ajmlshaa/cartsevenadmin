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
start "CartSeven Backend" /D "%~dp0server" cmd /k npm.cmd run dev

echo [3/3] Launching Frontend UI on port 5173...
start "CartSeven Frontend" /D "%~dp0client" cmd /k npm.cmd run dev

timeout /t 3 >nul
start http://localhost:5173

echo.
echo ========================================================================
echo CartSeven is running!
echo Access the web app at: http://localhost:5173
echo.
echo 3 Authorized Partners Configured in server/.env:
echo   1. Managing Partner: ajmalsha@cartseven.com (Admin)
echo   2. Finance Partner:  ashique@cartseven.com  (Accountant)
echo   3. Ops Partner:      shanu@cartseven.com    (Manager)
echo   Credentials secured in server/.env (Default: password123)
echo   Unauthorized visitors are automatically redirected to https://cartseven.com/
echo ========================================================================
echo.
echo Press any key to stop this window (servers will continue in background)...
pause >nul
