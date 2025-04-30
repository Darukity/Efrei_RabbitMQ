@echo off
setlocal enabledelayedexpansion

echo Checking system requirements...

:: Vérifie Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js first.
    PAUSE
    exit /b
)

:: Vérifie npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo npm is not installed. Please install npm first.
    PAUSE
    exit /b
)

:: Vérifie Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python is not installed. Please install Python first.
    PAUSE
    exit /b
)

:: Vérifie pip
where pip >nul 2>nul
if %errorlevel% neq 0 (
    echo pip is not installed. Please install pip first.
    PAUSE
    exit /b
)

:: Vérifie Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Git is not installed. Please install Git first.
    PAUSE
    exit /b
)

:: Vérifie les versions minimales

:: Node >= 20.11.0
for /f "tokens=2 delims=v" %%v in ('node -v') do set NODE_VER=%%v
for /f "tokens=1-3 delims=." %%a in ("!NODE_VER!") do (
    if %%a lss 20 (
        echo Node.js version must be >= 20.11.0, current: !NODE_VER!
        PAUSE
        exit /b
    )
    if %%a==20 if %%b lss 11 (
        echo Node.js version must be >= 20.11.0, current: !NODE_VER!
        PAUSE
        exit /b
    )
)

:: npm >= 10.5.0
for /f "tokens=1-3 delims=." %%a in ('npm -v') do (
    set NPM_MAJOR=%%a
    set NPM_MINOR=%%b
    if !NPM_MAJOR! lss 10 (
        echo npm version must be >= 10.5.0
        PAUSE
        exit /b
    )
    if !NPM_MAJOR!==10 if !NPM_MINOR! lss 5 (
        echo npm version must be >= 10.5.0
        PAUSE
        exit /b
    )
)

:: Python >= 3.12.0
for /f "tokens=2 delims= " %%v in ('python --version') do set PY_VER=%%v
for /f "tokens=1-3 delims=." %%a in ("!PY_VER!") do (
    if %%a lss 3 (
        echo Python version must be >= 3.12.0, current: !PY_VER!
        PAUSE
        exit /b
    )
    if %%a==3 if %%b lss 12 (
        echo Python version must be >= 3.12.0, current: !PY_VER!
        PAUSE
        exit /b
    )
)

:: pip >= 25.0.1
for /f "tokens=1-3 delims=." %%a in ('pip --version') do (
    set PIP_MAJOR=%%a
    set PIP_MINOR=%%b
    if !PIP_MAJOR! lss 25 (
        echo pip version must be >= 25.0.1
        PAUSE
        exit /b
    )
    if !PIP_MAJOR!==25 if !PIP_MINOR! lss 1 (
        echo pip version must be >= 25.0.1
        PAUSE
        exit /b
    )
)

echo All system requirements are met.
echo Downloading distant repository...
git clone git@github.com:Darukity/Efrei_RabbitMQ.git
cd Efrei_RabbitMQ

echo Installing Node.js modules...
call npm install

echo Installing Python packages...
call pip install -r requirements.txt

echo Ready to go!
echo Read the README.md file for more information.
PAUSE