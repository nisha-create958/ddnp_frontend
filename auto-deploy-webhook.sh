#!/bin/bash

# Auto-deployment script for GitHub webhooks
# This script will be triggered by GitHub webhooks for automatic deployment

DOMAIN="ddnp.in"
WEB_ROOT="/var/www/$DOMAIN"
LOG_FILE="/var/log/ddnp-deploy.log"

echo "$(date): Starting auto-deployment..." >> $LOG_FILE

# Navigate to web root
cd $WEB_ROOT

# Pull latest changes from GitHub
echo "$(date): Pulling latest changes from GitHub..." >> $LOG_FILE
git pull origin main >> $LOG_FILE 2>&1

# Set proper permissions
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Reload Nginx (if needed)
sudo systemctl reload nginx

echo "$(date): Auto-deployment completed successfully!" >> $LOG_FILE

# Optional: Send notification (uncomment if needed)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"DDNP website updated successfully!"}' \
#   YOUR_SLACK_WEBHOOK_URL
