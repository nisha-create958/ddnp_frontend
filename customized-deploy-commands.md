# Customized Deployment Commands for nisha-create958/ddnp_frontend

Based on your GitHub repo: https://github.com/nisha-create958/ddnp_frontend

## Step 1: Edit the deployment script on your VPS

```bash
# Edit the script to use your specific repository
nano github-deploy.sh
```

**Change this line in the script:**
```bash
GITHUB_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"
```

**To:**
```bash
GITHUB_REPO="https://github.com/nisha-create958/ddnp_frontend.git"
```

## Step 2: Run the deployment script

```bash
# Make it executable and run
chmod +x github-deploy.sh
./github-deploy.sh
```

## Step 3: Configure Nginx for ddnp.in

```bash
# Create Nginx configuration for ddnp.in
cat > /etc/nginx/sites-available/ddnp.in << 'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name ddnp.in www.ddnp.in;
    
    root /var/www/ddnp.in;
    index index.html index.htm;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' *.onrender.com" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security - hide sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~* \.(bak|backup|old|orig|original|md|sh)$ {
        deny all;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/ddnp.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# If test passes, restart Nginx
systemctl restart nginx
```

## Step 4: Setup SSL Certificate

```bash
# Install SSL certificate for ddnp.in
certbot --nginx -d ddnp.in -d www.ddnp.in

# Follow the prompts:
# 1. Enter your email address
# 2. Agree to terms of service (Y)
# 3. Choose whether to share email with EFF (Y/N)
# 4. Choose to redirect HTTP to HTTPS (recommended: 2)
```

## Step 5: Final verification

```bash
# Check if Nginx is running
systemctl status nginx

# Check if your website is accessible
curl -I http://ddnp.in

# Check SSL certificate
curl -I https://ddnp.in
```

## Step 6: Set proper permissions

```bash
# Set ownership and permissions
chown -R www-data:www-data /var/www/ddnp.in
chmod -R 755 /var/www/ddnp.in

# Restart Nginx one more time
systemctl restart nginx
```

## Future Updates

To update your website in the future:

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Navigate to website directory
cd /var/www/ddnp.in

# Pull latest changes from GitHub
git pull origin main

# Reload Nginx
systemctl reload nginx
```

## Troubleshooting

If something goes wrong:

```bash
# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Check if port 80 and 443 are open
netstat -tlnp | grep :80
netstat -tlnp | grep :443

# Test domain resolution
nslookup ddnp.in

# Check website response
curl -v http://ddnp.in
```
