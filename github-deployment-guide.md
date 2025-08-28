# GitHub Deployment Guide for ddnp.in

## 🚀 Deploy from GitHub Repository to Hostinger VPS

### Prerequisites
- GitHub repository with your DDNP frontend code
- Hostinger VPS with SSH access
- Domain ddnp.in pointing to your VPS IP

---

## Step 1: Push Your Code to GitHub

### If you don't have a GitHub repo yet:
```bash
# In your local project directory
cd /Users/jatin/Downloads/ddnp_frontend

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - DDNP Frontend"

# Add remote repository (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/ddnp-frontend.git

# Push to GitHub
git push -u origin main
```

### If you already have a repo:
```bash
# Just push your latest changes
cd /Users/jatin/Downloads/ddnp_frontend
git add .
git commit -m "Updated DDNP frontend"
git push origin main
```

---

## Step 2: Deploy on Hostinger VPS

### Connect to your VPS:
```bash
ssh root@YOUR_VPS_IP
```

### Run the deployment script:
```bash
# Download and run the GitHub deployment script
wget https://raw.githubusercontent.com/YOUR_USERNAME/ddnp-frontend/main/github-deploy.sh
chmod +x github-deploy.sh

# Edit the script to add your GitHub repo URL
nano github-deploy.sh
# Update this line: GITHUB_REPO="https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git"

# Run the deployment
./github-deploy.sh
```

### Configure Nginx:
```bash
# Create Nginx configuration
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
    
    # Security
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/ddnp.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and restart Nginx
nginx -t
systemctl restart nginx
```

### Setup SSL Certificate:
```bash
# Get SSL certificate
certbot --nginx -d ddnp.in -d www.ddnp.in

# Follow the prompts and choose to redirect HTTP to HTTPS
```

---

## Step 3: Setup Auto-Deployment (Optional)

### Create webhook endpoint:
```bash
# Install webhook handler
sudo apt install webhook -y

# Create webhook configuration
cat > /etc/webhook.conf << 'EOF'
[
  {
    "id": "ddnp-deploy",
    "execute-command": "/var/www/ddnp.in/auto-deploy-webhook.sh",
    "command-working-directory": "/var/www/ddnp.in",
    "response-message": "Deploying DDNP website...",
    "trigger-rule": {
      "match": {
        "type": "payload-hash-sha1",
        "secret": "YOUR_WEBHOOK_SECRET",
        "parameter": {
          "source": "header",
          "name": "X-Hub-Signature"
        }
      }
    }
  }
]
EOF

# Make auto-deploy script executable
chmod +x /var/www/ddnp.in/auto-deploy-webhook.sh

# Start webhook service
webhook -hooks /etc/webhook.conf -verbose -port 9000 &
```

### Configure GitHub Webhook:
1. Go to your GitHub repository
2. Settings → Webhooks → Add webhook
3. Payload URL: `http://YOUR_VPS_IP:9000/hooks/ddnp-deploy`
4. Content type: `application/json`
5. Secret: `YOUR_WEBHOOK_SECRET` (same as in webhook.conf)
6. Events: `Just the push event`

---

## Step 4: Manual Updates

### To update your website manually:
```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Navigate to website directory
cd /var/www/ddnp.in

# Pull latest changes
git pull origin main

# Reload Nginx if needed
systemctl reload nginx
```

---

## Step 5: Configure DNS

In your domain registrar, set these DNS records:
```
Type: A
Name: @
Value: YOUR_VPS_IP

Type: A
Name: www  
Value: YOUR_VPS_IP
```

---

## 🎉 Your Website Will Be Live At:
- https://ddnp.in
- https://www.ddnp.in

## Benefits of GitHub Deployment:
- ✅ Version control and history
- ✅ Easy rollbacks if needed
- ✅ Automatic deployments with webhooks
- ✅ Collaborative development
- ✅ Backup of your code on GitHub

## Troubleshooting:
```bash
# Check Nginx status
systemctl status nginx

# Check Nginx logs
tail -f /var/log/nginx/error.log

# Check deployment logs
tail -f /var/log/ddnp-deploy.log

# Test website
curl -I https://ddnp.in
```
