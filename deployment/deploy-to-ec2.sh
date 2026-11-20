#!/bin/bash
# EC2 Deployment Script for SkillSage

# Update system packages
sudo yum update -y || sudo apt update -y

# Install Docker
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    sudo yum install -y docker || sudo apt install -y docker.io
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Clone or update repository
if [ -d "skillSage" ]; then
    cd skillSage
    git pull
else
    git clone https://your-repo-url/skillSage.git
    cd skillSage
fi

# Create environment file
cat > .env << EOL
PORT=5000
FRONTEND_URL=${FRONTEND_URL:-localhost}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD:-your_secure_password}
DB_HOST=${DB_HOST:-your_rds_endpoint}
DB_NAME=${DB_NAME:-SkillSage}
DB_PORT=${DB_PORT:-5432}
COOKIE_NAME=auth_token
COOKIE_SECRET=${COOKIE_SECRET:-your_secure_cookie_secret}
JWT_SECRET=${JWT_SECRET:-your_secure_jwt_secret}
O1_KEY=${O1_KEY:-your_openai_key}
GOD_PASSWORD=${GOD_PASSWORD:-your_secure_god_password}
DATABASE_ONLINE=true
EOL

# Build and start application
cd backend
docker build -t skillsage-backend .
docker stop skillsage-backend-container || true
docker rm skillsage-backend-container || true
docker run -d --name skillsage-backend-container \
    --restart always \
    -p 5000:5000 \
    --env-file .env \
    skillsage-backend

echo "SkillSage deployed successfully!"
