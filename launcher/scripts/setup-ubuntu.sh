#!/bin/bash
# BotBrowser Launcher Setup Script for Ubuntu/Debian
# Run: curl -fsSL https://raw.githubusercontent.com/botswin/BotBrowser/main/launcher/scripts/setup-ubuntu.sh | bash

set -e

NODE_VERSION="24.13.0"
REPO_ZIP_URL="https://github.com/botswin/BotBrowser/archive/refs/heads/main.zip"
INSTALL_DIR="$HOME/.botbrowser"
NODE_DIR="$INSTALL_DIR/node"
REPO_DIR="$INSTALL_DIR/BotBrowser"

echo "=== BotBrowser Launcher Setup ==="

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-arm64.tar.xz"
    NODE_EXTRACTED="node-v${NODE_VERSION}-linux-arm64"
else
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz"
    NODE_EXTRACTED="node-v${NODE_VERSION}-linux-x64"
fi

# Install required tools
if ! command -v unzip &> /dev/null || ! command -v curl &> /dev/null || ! command -v xz &> /dev/null; then
    echo "Installing required tools..."
    sudo apt-get update
    sudo apt-get install -y curl unzip xz-utils
fi

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download and extract Node.js
if [ ! -f "$NODE_DIR/bin/node" ]; then
    echo "Downloading Node.js v${NODE_VERSION} for ${ARCH}..."
    curl -fsSL "$NODE_URL" -o /tmp/node.tar.xz

    echo "Extracting Node.js..."
    tar -xJf /tmp/node.tar.xz -C "$INSTALL_DIR"
    mv "$INSTALL_DIR/$NODE_EXTRACTED" "$NODE_DIR"
    rm /tmp/node.tar.xz
    echo "Node.js installed."
else
    echo "Node.js already installed."
fi

# Set PATH for this session
export PATH="$NODE_DIR/bin:$PATH"

# Verify Node.js
echo "Node.js version: $("$NODE_DIR/bin/node" --version)"

# Install Neutralino CLI
echo "Installing Neutralino CLI..."
"$NODE_DIR/bin/npm" install -g @neutralinojs/neu
echo "Neutralino CLI installed."

# Download repository
if [ -d "$REPO_DIR" ]; then
    rm -rf "$REPO_DIR"
fi
echo "Downloading repository..."
curl -fsSL "$REPO_ZIP_URL" -o /tmp/botbrowser.zip

echo "Extracting repository..."
unzip -q /tmp/botbrowser.zip -d "$INSTALL_DIR"
mv "$INSTALL_DIR/BotBrowser-main" "$REPO_DIR"
rm /tmp/botbrowser.zip

# Build and run
cd "$REPO_DIR/launcher"

echo "Installing dependencies..."
"$NODE_DIR/bin/npm" ci

echo "Downloading Neutralino binaries..."
"$NODE_DIR/bin/npx" @neutralinojs/neu update

echo "Building application..."
"$NODE_DIR/bin/npm" run build

echo "Starting application..."
"$NODE_DIR/bin/npm" run app
