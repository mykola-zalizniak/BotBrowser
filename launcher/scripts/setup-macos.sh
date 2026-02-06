#!/bin/bash
# BotBrowser Launcher Setup Script for macOS
# Run: curl -fsSL https://raw.githubusercontent.com/botswin/BotBrowser/main/launcher/scripts/setup-macos.sh | bash

set -e

NODE_VERSION="24.13.0"
REPO_ZIP_URL="https://github.com/botswin/BotBrowser/archive/refs/heads/main.zip"
INSTALL_DIR="$HOME/.botbrowser"
NODE_DIR="$INSTALL_DIR/node"
REPO_DIR="$INSTALL_DIR/BotBrowser"

echo "=== BotBrowser Launcher Setup ==="

# Detect architecture
ARCH=$(uname -m)
if [ "$ARCH" = "arm64" ]; then
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-arm64.tar.gz"
    NODE_EXTRACTED="node-v${NODE_VERSION}-darwin-arm64"
else
    NODE_URL="https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-darwin-x64.tar.gz"
    NODE_EXTRACTED="node-v${NODE_VERSION}-darwin-x64"
fi

# Create install directory
mkdir -p "$INSTALL_DIR"

# Download and extract Node.js
if [ ! -f "$NODE_DIR/bin/node" ]; then
    echo "Downloading Node.js v${NODE_VERSION} for ${ARCH}..."
    curl -fsSL "$NODE_URL" -o /tmp/node.tar.gz

    echo "Extracting Node.js..."
    tar -xzf /tmp/node.tar.gz -C "$INSTALL_DIR"
    mv "$INSTALL_DIR/$NODE_EXTRACTED" "$NODE_DIR"
    rm /tmp/node.tar.gz
    echo "Node.js installed."
else
    echo "Node.js already installed."
fi

# Set PATH for this session
export PATH="$NODE_DIR/bin:$PATH"

# Verify Node.js
echo "Node.js version: $("$NODE_DIR/bin/node" --version)"

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

echo "Building application..."
"$NODE_DIR/bin/npm" run build

echo "Starting application..."
"$NODE_DIR/bin/npm" run app
