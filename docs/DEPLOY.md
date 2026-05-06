# Deployment Guide - DeepHire

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Building for Production](#building-for-production)
5. [Docker Deployment](#docker-deployment)
6. [Cloud Deployment](#cloud-deployment)
7. [Database Setup](#database-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)
10. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### System Requirements

- **OS**: Linux (Ubuntu 20.04+), macOS, or Windows with WSL2
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **Git**: v2.30.0 or higher
- **Docker**: v20.10.0+ (for containerized deployment)
- **Docker Compose**: v1.29.0+ (optional, for local orchestration)

### Required Accounts

- **MongoDB Atlas**: Cloud database hosting
- **AWS**: For S3 video storage (or alternative storage service)
- **Clerk**: OAuth and authentication platform
- **Groq**: LLM API access

### Required Credentials

Gather the following credentials before deployment:

```
- MongoDB Atlas connection string
- AWS access key and secret
- Clerk API keys (frontend and backend)
- Groq API key
- JWT secret key (generate a strong random string)
- Environment: production/staging/development
```

## Local Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/deephire.git
cd deephire
```

### 2. Install Dependencies

**Backend Setup**:

```bash
cd server
npm install
```

**Frontend Setup**:

```bash
cd ../client
npm install
```

### 3. Behavioral Interview-Specific Configuration

**Load Company-Specific Question Libraries**:

```bash
# Load pre-configured company question libraries
cd server
npm run load:company-libraries

# This loads question banks for:
# - Amazon (Amazon Leadership Principles)
# - Google (Google Competencies)
# - Meta (Meta Core Competencies)
# - Microsoft (Microsoft Competencies)
# - Apple (Apple Interview Framework)
```

**Initialize STAR Method Training Data**:

```bash
npm run init:star-framework
# Loads STAR detection models and training examples
```

**Setup Competency Framework**:

```bash
npm run init:competencies
# Initializes SHRM competency framework and benchmarks
```

### 4. Environment Configuration

**Backend `.env` file** (`server/.env`):

```bash
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database
MONGODB_URI=mongodb://localhost:27017/deephire
MONGODB_NAME=deephire

# Authentication
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRY=7d
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret

# AI Services - Behavioral Interview
GROQ_API_KEY=your_groq_api_key
LANGCHAIN_API_KEY=your_langchain_api_key
LANGCHAIN_TRACING_V2=true

# STAR Detection Model (optional - for advanced NLP)
STAR_MODEL_PATH=./models/star-detection-model

# Competency Framework
COMPETENCY_FRAMEWORK=shrm  # or custom
BENCHMARK_PERCENTILES=true

# AWS S3 (for video storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=deephire-interviews

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_FORMAT=json

# Interview-Specific Settings
INTERVIEW_TIMEOUT_MINUTES=45
STAR_COMPLIANCE_THRESHOLD=70
STRESS_INTERVIEW_ENABLED=true
FOLLOW_UP_QUESTION_DEPTH=3
```

**Frontend `.env` file** (`client/.env`):

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_API_TIMEOUT=30000

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Environment
VITE_ENV=development
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_STRESS_INTERVIEW=true
VITE_ENABLE_PEER_BENCHMARKING=true
VITE_ENABLE_COMPANY_LIBRARIES=true
```

### 5. Start Development Servers

**Start MongoDB** (if running locally):

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or native MongoDB
mongod
```

**Start Backend Server**:

```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend Development Server** (in another terminal):

```bash
cd client
npm run dev
# App runs on http://localhost:5173
```

### 6. Verify Installation

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Database: localhost:27017

Test API health:

```bash
curl http://localhost:5000/api/health
```

Test STAR detection service:

```bash
curl -X POST http://localhost:5000/api/services/star/test \
  -H "Content-Type: application/json" \
  -d '{"response": "I faced a challenging situation when my team was behind on deadline..."}'
```

## Environment Configuration

### Development vs. Production

| Variable      | Development     | Production     |
| ------------- | --------------- | -------------- |
| NODE_ENV      | development     | production     |
| Debug Logging | true            | false          |
| CORS          | localhost:5173  | yourdomain.com |
| JWT_EXPIRY    | 7d              | 1d             |
| DB Connection | local/atlas dev | atlas prod     |
| S3 Bucket     | deephire-dev    | deephire-prod  |
| HTTPS         | false           | true           |

### Secrets Management

**Development**: Use `.env` files (add to `.gitignore`)
**Production**: Use secure secret management:

- **AWS Secrets Manager**: Store sensitive credentials
- **Kubernetes Secrets**: For Kubernetes deployments
- **Environment Variables**: In deployment platform (Vercel, Heroku, etc.)
- **HashiCorp Vault**: For complex multi-service setups

**Accessing Secrets**:

```javascript
// In code
const apiKey = process.env.GROQ_API_KEY;

// Validate required secrets
const requiredSecrets = ["GROQ_API_KEY", "JWT_SECRET", "MONGODB_URI"];
requiredSecrets.forEach((secret) => {
  if (!process.env[secret]) {
    throw new Error(`Missing required environment variable: ${secret}`);
  }
});
```

## Building for Production

### Frontend Build

```bash
cd client

# Build optimized production bundle
npm run build

# Output directory: dist/
# Includes: minified JS, CSS, optimized assets
```

**Build Configuration** (`vite.config.js`):

```javascript
export default {
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          three: ["three"],
          ui: ["@react-three/fiber", "@react-three/drei"],
        },
      },
    },
  },
};
```

### Backend Build

```bash
cd server

# Ensure dependencies are production-only
npm ci --only=production

# No build step needed for Node.js, but verify:
# - All imports resolve correctly
# - No missing dependencies
npm ls
```

**Production Dependencies Check**:

```bash
# Remove devDependencies for production
npm prune --production

# Verify file structure
ls -la
node index.js  # Test start
```

### Lint and Test

```bash
# Lint code
npm run lint

# Run tests (if available)
npm run test

# Security audit
npm audit
```

## Docker Deployment

### Docker Setup

**Build Images**:

```bash
# Build backend image
cd server
docker build -t deephire-backend:1.0.0 .
docker tag deephire-backend:1.0.0 deephire-backend:latest

# Build frontend image
cd ../client
docker build -t deephire-frontend:1.0.0 .
docker tag deephire-frontend:1.0.0 deephire-frontend:latest
```

**Dockerfiles**:

**Backend** (`server/Dockerfile`):

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["node", "index.js"]
```

**Frontend** (`client/Dockerfile`):

```dockerfile
# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose Setup

**docker-compose.yml**:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo:latest
    container_name: deephire-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
    networks:
      - deephire-network

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: deephire-backend
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/deephire
      JWT_SECRET: ${JWT_SECRET}
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      GROQ_API_KEY: ${GROQ_API_KEY}
      AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
      AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - mongodb
    networks:
      - deephire-network
    restart: always

  frontend:
    build:
      context: ./client
      dockerfile: Dockerfile
    container_name: deephire-frontend
    ports:
      - "80:80"
    environment:
      VITE_API_BASE_URL: http://localhost:5000/api/v1
      VITE_CLERK_PUBLISHABLE_KEY: ${VITE_CLERK_PUBLISHABLE_KEY}
    depends_on:
      - backend
    networks:
      - deephire-network
    restart: always

volumes:
  mongo-data:

networks:
  deephire-network:
    driver: bridge
```

**Run with Docker Compose**:

```bash
# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

## Cloud Deployment

### Option 1: Vercel (Frontend) + Heroku (Backend)

**Deploy Frontend to Vercel**:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd client
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_BASE_URL=https://deephire-api.herokuapp.com/api/v1
VITE_CLERK_PUBLISHABLE_KEY=your_key
```

**Deploy Backend to Heroku**:

```bash
# Install Heroku CLI
npm i -g heroku

# Login
heroku login

# Create app
heroku create deephire-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=mongodb+srv://...
heroku config:set JWT_SECRET=your_secret
heroku config:set GROQ_API_KEY=your_key

# Deploy
cd server
git push heroku main
```

### Option 2: AWS (Full Stack)

**Setup EC2 Instance**:

```bash
# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Clone repository
git clone your-repo-url
cd deephire
```

**Deploy with PM2**:

```bash
# Backend
cd server
npm install
pm2 start index.js --name "deephire-backend" --watch

# Frontend (build and serve)
cd ../client
npm run build
pm2 serve dist 3000 --spa

# Save PM2 configuration
pm2 save
pm2 startup
```

**Setup Nginx Reverse Proxy**:

```nginx
# /etc/nginx/sites-available/deephire

upstream backend {
  server localhost:5000;
}

server {
  listen 80;
  server_name your-domain.com www.your-domain.com;

  location /api {
    proxy_pass http://backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
  }
}
```

**Enable SSL with Let's Encrypt**:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### Option 3: Google Cloud Run + Firebase

**Deploy Backend to Cloud Run**:

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT_ID/deephire-backend

# Deploy to Cloud Run
gcloud run deploy deephire-backend \
  --image gcr.io/PROJECT_ID/deephire-backend \
  --platform managed \
  --memory 512Mi \
  --set-env-vars "MONGODB_URI=...,JWT_SECRET=..."
```

**Deploy Frontend to Firebase Hosting**:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase project
firebase init

# Deploy
firebase deploy
```

## Database Setup

### MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to MongoDB Atlas console
   - Create organization and project
   - Create a cluster (shared tier for development)

2. **Create Database User**:

```bash
# In Atlas UI:
# Database Access > Add Database User
# Username: deephire_user
# Password: Generate secure password
# Roles: dbOwner on deephire database
```

3. **Whitelist IP Addresses**:

```bash
# Network Access > Add IP Address
# Add: 0.0.0.0/0 (for development, restrict in production)
```

4. **Get Connection String**:

```
mongodb+srv://deephire_user:PASSWORD@cluster0.xxxxx.mongodb.net/deephire?retryWrites=true&w=majority
```

5. **Initialize Collections and Indexes**:

```bash
# Connect to MongoDB
mongosh "mongodb+srv://deephire_user:PASSWORD@cluster0.xxxxx.mongodb.net/deephire"

# Create indexes
db.interviewSessions.createIndex({ "userId": 1, "createdAt": -1 })
db.interviewSessions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 })
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "clerkId": 1 })

# Verify indexes
db.interviewSessions.getIndexes()
```

### Backup and Recovery

**Manual Backup**:

```bash
mongodump --uri="mongodb+srv://user:password@cluster.mongodb.net/deephire" \
  --out=/backups/deephire-backup-$(date +%Y%m%d)
```

**Restore from Backup**:

```bash
mongorestore --uri="mongodb+srv://user:password@cluster.mongodb.net/deephire" \
  /backups/deephire-backup-20250505
```

## Monitoring & Logging

### Application Monitoring

**PM2 Monitoring**:

```bash
# View real-time monitoring
pm2 monit

# Create monitoring dashboard
pm2 web  # Access at http://localhost:9615
```

**Application Health Checks**:

```bash
# Backend health endpoint
curl http://localhost:5000/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2026-05-05T12:00:00Z",
  "uptime": 3600,
  "database": "connected"
}
```

### Logging

**Centralized Logging (Optional)**:

```bash
# Install ELK Stack or use cloud services like:
# - CloudWatch (AWS)
# - Stackdriver (Google Cloud)
# - DataDog
# - New Relic

# Example with Winston logger (backend)
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Error Tracking

**Sentry Integration**:

```javascript
// Backend
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.VITE_ENV,
});
```

## Troubleshooting

### Common Issues

**Port Already in Use**:

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**MongoDB Connection Failed**:

```bash
# Check connection string format
# mongodb+srv://user:password@host/database

# Test connection
mongosh "your_connection_string"

# Verify network access and IP whitelist
```

**Environment Variables Not Loading**:

```bash
# Verify .env file exists in correct location
ls -la .env

# Check for typos in .env
cat .env | grep -i variable_name

# Source environment in terminal
set -a
source .env
set +a
```

**High Memory Usage**:

```bash
# Check Node process memory
ps aux | grep node

# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

## Rollback Procedures

### Docker Rollback

```bash
# List available images
docker images

# Revert to previous version
docker run -d \
  --name deephire-backend \
  -p 5000:5000 \
  deephire-backend:1.0.0  # previous version tag
```

### Git-based Rollback

```bash
# View commit history
git log --oneline

# Revert to previous commit
git revert HEAD
git push origin main

# Or reset (destructive)
git reset --hard <commit-hash>
git push origin main --force-with-lease
```

### Database Rollback

```bash
# Restore from MongoDB backup
mongorestore --uri="mongodb+srv://user:password@host/db" \
  --nsInclude="deephire.*" \
  /backups/previous-backup
```

### Zero-Downtime Deployment

```bash
# Using PM2 cluster mode
pm2 start index.js -i max --name "deephire"
pm2 reload deephire  # Reloads without downtime
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database backups created
- [ ] SSL certificates installed
- [ ] Monitoring and logging set up
- [ ] Health checks configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Database indexes created
- [ ] Tests passing (npm test)
- [ ] Code linting passed (npm run lint)
- [ ] Performance benchmarks met
- [ ] Rollback plan documented
- [ ] Team trained on deployment
- [ ] Post-deployment verification checklist

---

**Document Version**: 1.0
**Last Updated**: 2026-05-05
**Next Review**: 2026-08-05
