# BotBrowser Launcher Setup Script for Windows
# Run: powershell -ExecutionPolicy Bypass -File setup.ps1

$ErrorActionPreference = "Stop"

$NODE_VERSION = "24.13.0"
$NODE_URL = "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-win-x64.zip"
$REPO_ZIP_URL = "https://github.com/botswin/BotBrowser/archive/refs/heads/main.zip"
$INSTALL_DIR = "$env:LOCALAPPDATA\BotBrowser"
$NODE_DIR = "$INSTALL_DIR\node"
$REPO_DIR = "$INSTALL_DIR\BotBrowser"

Write-Host "=== BotBrowser Launcher Setup ===" -ForegroundColor Cyan

# Create install directory
if (!(Test-Path $INSTALL_DIR)) {
    New-Item -ItemType Directory -Path $INSTALL_DIR | Out-Null
}

# Download and extract Node.js
if (!(Test-Path "$NODE_DIR\node.exe")) {
    Write-Host "Downloading Node.js v${NODE_VERSION}..." -ForegroundColor Yellow
    $zipPath = "$env:TEMP\node.zip"
    Invoke-WebRequest -Uri $NODE_URL -OutFile $zipPath

    Write-Host "Extracting Node.js..." -ForegroundColor Yellow
    Expand-Archive -Path $zipPath -DestinationPath $INSTALL_DIR -Force
    Rename-Item "$INSTALL_DIR\node-v${NODE_VERSION}-win-x64" $NODE_DIR -Force
    Remove-Item $zipPath
    Write-Host "Node.js installed." -ForegroundColor Green
} else {
    Write-Host "Node.js already installed." -ForegroundColor Green
}

# Set PATH for this session
$env:PATH = "$NODE_DIR;$env:PATH"

# Verify Node.js
$nodeVersion = & "$NODE_DIR\node.exe" --version
Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green

# Install Neutralino CLI
Write-Host "Installing Neutralino CLI..." -ForegroundColor Yellow
& "$NODE_DIR\npm.cmd" install -g @neutralinojs/neu
Write-Host "Neutralino CLI installed." -ForegroundColor Green

# Download repository
if (Test-Path $REPO_DIR) {
    Remove-Item -Recurse -Force $REPO_DIR
}
Write-Host "Downloading repository..." -ForegroundColor Yellow
$repoZipPath = "$env:TEMP\botbrowser.zip"
Invoke-WebRequest -Uri $REPO_ZIP_URL -OutFile $repoZipPath

Write-Host "Extracting repository..." -ForegroundColor Yellow
Expand-Archive -Path $repoZipPath -DestinationPath $INSTALL_DIR -Force
Rename-Item "$INSTALL_DIR\BotBrowser-main" $REPO_DIR -Force
Remove-Item $repoZipPath

# Build and run
Write-Host "Installing dependencies..." -ForegroundColor Yellow
Push-Location "$REPO_DIR\launcher"
& "$NODE_DIR\npm.cmd" ci

Write-Host "Downloading Neutralino binaries..." -ForegroundColor Yellow
& "$NODE_DIR\npx.cmd" @neutralinojs/neu update

Write-Host "Building application..." -ForegroundColor Yellow
& "$NODE_DIR\npm.cmd" run build

Write-Host "Starting application..." -ForegroundColor Green
& "$NODE_DIR\npm.cmd" run app
Pop-Location
