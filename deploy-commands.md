# DDNP Frontend Deployment Commands

## Step 1: Upload Files to VPS

### Option A: Using SCP (from your local machine)
```bash
# Upload all files to your VPS
scp -r /Users/jatin/Downloads/ddnp_frontend/* root@your-vps-ip:/var/www/ddnp.in/

# Or if using a specific user
scp -r /Users/jatin/Downloads/ddnp_frontend/* username@your-vps-ip:/var/www/ddnp.in/
```

### Option B: Using rsync (recommended)
```bash
# More efficient file transfer
rsync -avz --exclude='*.md' --exclude='deploy-*' --exclude='*.sh' /Users/jatin/Downloads/ddnp_frontend/ root@your-vps-ip:/var/www/ddnp.in/
```

### Option C: Using FileZilla or similar FTP client
- Host: your-vps-ip
- Username: root (or your username)
- Port: 22 (SFTP)
- Upload to: /var/www/ddnp.in/

## Step 2: Run Setup Script on VPS
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Make setup script executable and run it
chmod +x /var/www/ddnp.in/deploy-setup.sh
bash /var/www/ddnp.in/deploy-setup.sh
```

## Step 3: Configure Nginx on VPS
```bash
# Copy nginx configuration
sudo cp /var/www/ddnp.in/nginx-ddnp.conf /etc/nginx/sites-available/ddnp.in

# Enable the site
sudo ln -s /etc/nginx/sites-available/ddnp.in /etc/nginx/sites-enabled/

# Remove default nginx site
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Step 4: Setup SSL Certificate
```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d ddnp.in -d www.ddnp.in

# Follow the prompts and choose to redirect HTTP to HTTPS
```

## Step 5: Configure Domain DNS

In your domain registrar (where you bought ddnp.in), set these DNS records:

```
Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS

Type: A  
Name: www
Value: YOUR_VPS_IP_ADDRESS
```

## Step 6: Final Steps
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/ddnp.in
sudo chmod -R 755 /var/www/ddnp.in

# Restart nginx
sudo systemctl restart nginx

# Check if everything is running
sudo systemctl status nginx
```

## Troubleshooting Commands
```bash
# Check nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check nginx access logs  
sudo tail -f /var/log/nginx/access.log

# Test nginx configuration
sudo nginx -t

# Reload nginx without downtime
sudo systemctl reload nginx
```
