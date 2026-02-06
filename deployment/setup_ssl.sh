#!/bin/bash

# NexDoc AI SSL Setup Script using Certbot (Let's Encrypt)
# Supports: Ubuntu/Debian and CentOS/RHEL (EL8+)
# Run with sudo

set -e

echo "--- NexDoc AI SSL Setup (Certbot) ---"

if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (sudo)"
  exit 1
fi

# 1. Ask for Domain Name
read -p "Enter your domain name (e.g., nexdoc.example.com): " DOMAIN_NAME

if [ -z "$DOMAIN_NAME" ]; then
    echo "Error: Domain name is required."
    exit 1
fi

echo "Installing Certbot..."

# 2. Install Certbot
if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
elif command -v dnf &> /dev/null; then
    # RHEL/CentOS 8+
    dnf install -y certbot python3-certbot-nginx
elif command -v yum &> /dev/null; then
    # Older RHEL/CentOS
    yum install -y certbot python3-certbot-nginx
else
    echo "Error: Unsupported package manager. Please install certbot manually."
    exit 1
fi

# 3. Update Nginx Config with Domain Name
echo "Updating Nginx configuration for domain: $DOMAIN_NAME..."

# Detect config file
if [ -f "/etc/nginx/sites-available/nexdoc" ]; then
    NGINX_CONF="/etc/nginx/sites-available/nexdoc"
elif [ -f "/etc/nginx/conf.d/nexdoc.conf" ]; then
    NGINX_CONF="/etc/nginx/conf.d/nexdoc.conf"
else
    echo "Error: NexDoc Nginx configuration not found. Please run deploy.sh first."
    exit 1
fi

# Backup config
cp "$NGINX_CONF" "${NGINX_CONF}.bak"

# Update server_name in config
# Replaces 'server_name _;' with 'server_name example.com;'
sed -i "s/server_name _;/server_name $DOMAIN_NAME;/g" "$NGINX_CONF"

# Reload Nginx to apply server_name change
systemctl reload nginx

# 4. Run Certbot
echo "Running Certbot to obtain certificate..."
certbot --nginx -d "$DOMAIN_NAME"

echo "--- SSL Setup Complete! ---"
echo "Your site should now be accessible via https://$DOMAIN_NAME"
echo "Certificate auto-renewal is enabled by default."
