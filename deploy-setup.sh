#!/bin/bash

# DDNP Frontend Deployment Script for Hostinger VPS
# Run this script on your VPS after uploading your files

echo "=== DDNP Frontend Deployment Setup ==="

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Nginx
echo "Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
echo "Installing Certbot for SSL..."
sudo apt install certbot python3-certbot-nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Create directory for your website
sudo mkdir -p /var/www/ddnp.in
sudo chown -R $USER:$USER /var/www/ddnp.in
sudo chmod -R 755 /var/www/ddnp.in

echo "=== Setup Complete ==="
echo "Next steps:"
echo "1. Upload your website files to /var/www/ddnp.in/"
echo "2. Configure Nginx for ddnp.in domain"
echo "3. Setup SSL certificate"
