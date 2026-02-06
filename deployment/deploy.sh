#!/bin/bash

# NexDoc AI Deployment Script
# Supports: Ubuntu/Debian and CentOS/RHEL (EL8+)
# Run with sudo

set -e

# Resolve directories relative to script location
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SERVER_DIR="$PROJECT_ROOT/server"
WEB_DIR="$PROJECT_ROOT/web"
USER_NAME=$(whoami)

echo "--- NexDoc AI Deployment Started ---"
echo "Project Root: $PROJECT_ROOT"

# --- 1. System Detection & Dependency Installation ---
echo "[1/5] Checking System Dependencies..."

PYTHON_EXEC=""
PKG_MANAGER=""
OS_FAMILY=""

if command -v apt-get &> /dev/null; then
    PKG_MANAGER="apt-get"
    OS_FAMILY="debian"
    echo "Detected OS: Debian/Ubuntu"
    
    $PKG_MANAGER update
    $PKG_MANAGER install -y python3 python3-venv python3-pip nginx git libmagic1
    PYTHON_EXEC="python3"

elif command -v dnf &> /dev/null; then
    PKG_MANAGER="dnf"
    OS_FAMILY="rhel"
    echo "Detected OS: RHEL/CentOS/Fedora (using dnf)"
    
    # Try to install Python 3.9 or newer (Python 3.6 is too old)
    echo "Installing Python 3.9 and dependencies..."
    # file-libs provides libmagic needed for unstructured
    # We attempt to install epel-release just in case
    $PKG_MANAGER install -y epel-release || true
    $PKG_MANAGER install -y python39 python39-devel python39-pip nginx git gcc file-libs
    PYTHON_EXEC="python3.9"
    
    # Fallback to python3 if python3.9 not found (and hope system python is new enough)
    if ! command -v $PYTHON_EXEC &> /dev/null; then
        echo "Python 3.9 not found, falling back to python3..."
        $PKG_MANAGER install -y python3-devel python3-pip
        PYTHON_EXEC="python3"
    fi

elif command -v yum &> /dev/null; then
    PKG_MANAGER="yum"
    OS_FAMILY="rhel"
    echo "Detected OS: RHEL/CentOS (using yum)"
    
    $PKG_MANAGER install -y python39 python39-devel python39-pip nginx git gcc
    PYTHON_EXEC="python3.9"
    if ! command -v $PYTHON_EXEC &> /dev/null; then
        PYTHON_EXEC="python3"
    fi
else
    echo "Error: Unsupported package manager. Please install dependencies manually."
    exit 1
fi

# Verify Python Version
echo "Using Python executable: $PYTHON_EXEC"
PY_VERSION=$($PYTHON_EXEC -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Python Version: $PY_VERSION"

# Simple check for version >= 3.8
PY_MAJOR=$(echo "$PY_VERSION" | cut -d. -f1)
PY_MINOR=$(echo "$PY_VERSION" | cut -d. -f2)
if [ "$PY_MAJOR" -lt 3 ] || ([ "$PY_MAJOR" -eq 3 ] && [ "$PY_MINOR" -lt 8 ]); then
    echo "Error: Python 3.8+ is required. Found $PY_VERSION."
    echo "Please install a newer Python version manually."
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Node.js not found."
    if [ "$OS_FAMILY" = "debian" ]; then
        echo "Attempting to install Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    elif [ "$OS_FAMILY" = "rhel" ]; then
        echo "Attempting to install Node.js..."
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
        $PKG_MANAGER install -y nodejs
    else
        echo "Please install Node.js (v18+) manually."
        exit 1
    fi
fi

# --- 2. Setup Backend ---
echo "[2/5] Setting up Backend..."
cd "$SERVER_DIR"

# Handle invalid venv (e.g. Windows format or wrong python version)
if [ -d "venv" ]; then
    if [ ! -f "venv/bin/activate" ]; then
        echo "Removing invalid venv..."
        rm -rf venv
    else
        # Check if venv matches the current python executable
        VENV_PY_VER=$(venv/bin/python --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
        if [ "$VENV_PY_VER" != "$PY_VERSION" ]; then
            echo "Venv version ($VENV_PY_VER) differs from system ($PY_VERSION). Recreating..."
            rm -rf venv
        fi
    fi
fi

if [ ! -d "venv" ]; then
    echo "Creating virtual environment with $PYTHON_EXEC..."
    $PYTHON_EXEC -m venv venv
fi

echo "Installing backend dependencies..."
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn

echo "Installing Playwright browsers..."
playwright install chromium

# Install system dependencies for Playwright
if [ "$OS_FAMILY" = "debian" ]; then
    echo "Installing Playwright dependencies (apt)..."
    playwright install-deps chromium
elif [ "$OS_FAMILY" = "rhel" ]; then
    echo "Installing Playwright dependencies (dnf/yum)..."
    # Playwright install-deps doesn't support RHEL well, so we install manually
    # Common dependencies for Chromium on RHEL 8
    $PKG_MANAGER install -y \
        at-spi2-atk at-spi2-core atk cairo cups-libs dbus-libs expat \
        flac-libs gdk-pixbuf2 glib2 glibc gtk3 libX11 libXcomposite \
        libXdamage libXext libXfixes libXrandr libXrender libXtst \
        libcanberra-gtk3 libdrm libgcc libstdc++ libxcb libxkbcommon \
        libxshmfence mesa-libgbm nspr nss nss-util pango pipewire-libs \
        systemd-libs vulkan-loader xorg-x11-server-Xvfb zlib
else
    echo "Warning: Unknown OS family. Skipping Playwright dependency installation."
fi

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || touch .env
    # Only append if SECRET_KEY not present
    if ! grep -q "SECRET_KEY" .env; then
        echo "SECRET_KEY=$(openssl rand -hex 32)" >> .env
    fi
fi
deactivate

# --- 3. Setup Frontend ---
echo "[3/5] Setting up Frontend..."
cd "$WEB_DIR"

echo "Installing frontend dependencies..."
npm install

# Ensure executables have permission (common issue when running as root/sudo)
chmod +x node_modules/.bin/*

echo "Building frontend..."
npm run build

# --- 4. Setup Systemd Service ---
echo "[4/5] Configuring Systemd Service..."
SERVICE_FILE="/etc/systemd/system/nexdoc-backend.service"

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=NexDoc AI Backend Service
After=network.target

[Service]
User=$USER_NAME
Group=$USER_NAME
WorkingDirectory=$SERVER_DIR
Environment="PATH=$SERVER_DIR/venv/bin"
ExecStart=$SERVER_DIR/venv/bin/gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000
Restart=always

[Install]
WantedBy=multi-user.target
EOF

echo "Reloading systemd..."
systemctl daemon-reload
systemctl enable nexdoc-backend
systemctl restart nexdoc-backend

# --- 5. Setup Nginx ---
echo "[5/5] Configuring Nginx..."

# Determine Nginx config location
if [ -d "/etc/nginx/sites-available" ]; then
    # Debian/Ubuntu style
    NGINX_CONF="/etc/nginx/sites-available/nexdoc"
    LINK_PATH="/etc/nginx/sites-enabled/nexdoc"
    USE_LINKING=true
    
    # Remove default
    rm /etc/nginx/sites-enabled/default 2>/dev/null || true
else
    # RHEL/CentOS style (usually /etc/nginx/conf.d/)
    NGINX_CONF="/etc/nginx/conf.d/nexdoc.conf"
    USE_LINKING=false
    
    # Try to remove default.conf if it exists in conf.d
    rm /etc/nginx/conf.d/default.conf 2>/dev/null || true
    
    # On RHEL/CentOS, the default server is often in /etc/nginx/nginx.conf
    # We need to disable it to avoid "conflicting server name" warning and ensure our config works
    if grep -q "default_server" /etc/nginx/nginx.conf; then
        echo "Disabling default_server in /etc/nginx/nginx.conf..."
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak
        # Comment out lines containing 'listen ... default_server'
        sed -i '/listen.*default_server/s/^/#/' /etc/nginx/nginx.conf
    fi
fi

cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name _;

    # Frontend (Static Files)
    location / {
        root $WEB_DIR/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

if [ "$USE_LINKING" = true ]; then
    if [ -L "$LINK_PATH" ]; then
        rm "$LINK_PATH"
    fi
    ln -s "$NGINX_CONF" "$LINK_PATH"
fi

echo "Testing Nginx config..."
nginx -t

# Reload Nginx (handle different service names/states)
systemctl enable nginx
systemctl restart nginx

echo "--- Deployment Complete! ---"
echo "Backend: Running on 127.0.0.1:8000 (Systemd: nexdoc-backend)"
echo "Frontend: Served by Nginx on port 80"
echo "Python Version Used: $PY_VERSION"
echo "IMPORTANT: Configure 'server/.env' with your API Keys and Database URL!"
