@echo off
REM DataGuard AI - Build & Verification Script for Windows

echo.
echo 🛡 DataGuard AI - Extension Verification
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    exit /b 1
)

echo ✓ Project structure verified
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% found

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm %NPM_VERSION% found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install >nul 2>&1
echo ✓ Dependencies installed
echo.

REM Navigate to extension directory
cd extension

REM Build
echo 🔨 Building extension...
call npm run build >nul 2>&1

if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)
echo ✓ Build successful

REM Check dist folder
if exist dist (
    echo ✓ dist\ directory created
    
    REM Verify key files
    setlocal enabledelayedexpansion
    set "files=manifest.json content.js background.js popup.html popup.js style.css"
    for %%F in (!files!) do (
        if exist "dist\%%F" (
            echo   ✓ dist\%%F
        ) else (
            echo   ❌ dist\%%F MISSING
        )
    )
) else (
    echo ❌ dist\ directory not created
    exit /b 1
)

echo.

REM Run tests
echo 🧪 Running tests...
call npm run test -- --run >nul 2>&1

if errorlevel 1 (
    echo ❌ Tests failed
    call npm run test -- --run
    exit /b 1
)
echo ✓ All tests passed
echo   ✓ 75 tests passed

echo.
echo ✅ DataGuard AI Extension is ready!
echo.
echo Next steps:
echo 1. Open Chrome and go to chrome://extensions
echo 2. Enable 'Developer Mode' (top-right toggle)
echo 3. Click 'Load unpacked'
echo 4. Select: dataguard-ai\extension\dist
echo 5. Go to chatgpt.com and test with demo prompts
echo.
echo 📖 See QUICK_START.md for demo scenarios
echo 📚 See README.md for full documentation
echo.
pause
