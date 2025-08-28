#!/bin/bash

# DDNP Frontend GitHub Deployment Script for Hostinger VPS
# Run this script on your VPS

echo "=== DDNP Frontend GitHub Deployment ==="

# Configuration - UPDATE THESE VALUES
GITHUB_REPO="https://github.com/nisha-create958/ddnp_frontend.git"
DOMAIN="ddnp.in"
WEB_ROOT="/var/www/$DOMAIN"

echo "Setting up deployment for $DOMAIN from GitHub..."

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "Installing required packages..."
sudo apt install -y nginx git certbot python3-certbot-nginx curl

# Install Node.js (if needed for build processes)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create web directory
echo "Creating web directory..."
sudo mkdir -p $WEB_ROOT
sudo chown -R $USER:$USER $WEB_ROOT

# Clone repository
echo "Cloning repository..."
if [ -d "$WEB_ROOT/.git" ]; then
    echo "Repository already exists, pulling latest changes..."
    cd $WEB_ROOT
    git pull origin main
else
    echo "Cloning fresh repository..."
    git clone $GITHUB_REPO $WEB_ROOT
    cd $WEB_ROOT
fi

# Set proper permissions
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

echo "=== GitHub Deployment Setup Complete ==="
echo "Next steps:"
echo "1. Update GITHUB_REPO variable in this script"
echo "2. Configure Nginx for $DOMAIN"
echo "3. Setup SSL certificate"
echo "4. Configure GitHub webhook for auto-deployment (optional)"
