# CityHunter Backend - Docker Deployment Guide

This guide explains how to deploy the **CityHunter** backend application using Docker Compose.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Deployment Steps](#deployment-steps)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)
- [Production Considerations](#production-considerations)

---

## Prerequisites

Before deploying, ensure you have the following installed:

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Git**: For cloning the repository (if needed)

Verify your installations:
```bash
docker --version
docker compose version
```

---

## Quick Start

For a quick deployment, follow these steps:

```bash
# 1. Navigate to the project directory
cd c:\Users\Lenovo\GIT\cityHunter\vibe\hunterBack

# 2. Copy the example environment file
cp .env.example .env

# 3. Edit .env with your actual credentials
# (See Configuration section below)

# 4. Build and start the application
docker compose up --build -d

# 5. Check the logs
docker compose logs -f cityhunter-api
```

The API will be available at `http://localhost:8080`

---

## Configuration

### Environment Variables

The application requires several environment variables to be configured in the `.env` file:

#### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | Database name | `hunter_db` |
| `SECRET_KEY` | JWT secret key (use a strong random string) | `your-super-secret-key-here-change-this` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time in minutes | `10080` (7 days) |
| `API_KEY` | API key for protected endpoints | `your-api-key-here` |

#### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `False` |
| `PORT` | Application port | `8080` |
| `RESEND_API_KEY` | Resend email service API key | - |
| `GOOGLE_MAPS_API_KEY` | Google Maps API key | - |

### Setting Up Environment Variables

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your actual credentials:
   ```bash
   # On Windows
   notepad .env
   
   # On Linux/Mac
   nano .env
   ```

3. **Generate a secure SECRET_KEY**:
   ```bash
   # Using Python
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   
   # Using OpenSSL
   openssl rand -base64 32
   ```

> [!IMPORTANT]
> Never commit your `.env` file to version control. It contains sensitive credentials.

---

## Deployment Steps

### Step 1: Build the Docker Image

Build the Docker image for the CityHunter API:

```bash
docker compose build
```

This command:
- Uses the `Dockerfile` to create an image
- Installs Python dependencies using `uv`
- Compiles bytecode for better performance
- Prepares the application for production

### Step 2: Start the Services

Start the application in detached mode:

```bash
docker compose up -d
```

The service name in Docker Compose is **`cityhunter-api`** (defined as `api` in the compose file, but prefixed with the project name).

### Step 3: View Logs

Monitor the application logs:

```bash
# Follow logs in real-time
docker compose logs -f

# View logs for the API service only
docker compose logs -f api

# View last 100 lines
docker compose logs --tail=100
```

### Step 4: Check Container Status

Verify the container is running:

```bash
docker compose ps
```

Expected output:
```
NAME                COMMAND                  SERVICE   STATUS    PORTS
cityhunter-api-1    "sh -c 'uv run uvico…"   api       Up        0.0.0.0:8080->8080/tcp
```

---

## Verification

### Health Check

Test if the API is responding:

```bash
# Check API health
curl http://localhost:8080/health

# View API documentation
# Open in browser: http://localhost:8080/docs
```

### Test Authentication

```bash
# Register a new user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123",
    "handle": "testuser"
  }'

# Login
curl -X POST http://localhost:8080/api/v1/auth/access-token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpassword123"
```

### Interactive API Documentation

Open your browser and navigate to:
- **Swagger UI**: `http://localhost:8080/docs`
- **ReDoc**: `http://localhost:8080/redoc`

---

## Docker Compose Service Configuration

The application is deployed with the following configuration:

```yaml
services:
  api:
    build: .
    ports:
      - "8080:8080"
    env_file:
      - .env
    command: >
      sh -c "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}"
```

### Service Name: `cityhunter-api`

The service is named **`api`** in the `docker-compose.yml` file, but Docker Compose prefixes it with the project directory name, resulting in the container name `cityhunter-api-1`.

### Key Configuration Details:

- **Build Context**: Current directory (`.`)
- **Port Mapping**: Host port `8080` → Container port `8080`
- **Environment**: Loaded from `.env` file
- **Command**: Runs Uvicorn ASGI server with the FastAPI app
- **Host Binding**: `0.0.0.0` to accept external connections

---

## Troubleshooting

### Container Won't Start

**Check logs for errors**:
```bash
docker compose logs api
```

**Common issues**:
- Missing or invalid environment variables
- MongoDB connection failure
- Port 8080 already in use

**Solution for port conflict**:
```bash
# Change port in docker-compose.yml
ports:
  - "8081:8080"  # Use port 8081 on host
```

### Database Connection Issues

**Verify MongoDB URI**:
- Ensure `MONGO_URI` is correct in `.env`
- Check network connectivity to MongoDB
- Verify database credentials

**Test MongoDB connection**:
```bash
# From within the container
docker compose exec api python -c "from motor.motor_asyncio import AsyncIOMotorClient; client = AsyncIOMotorClient('YOUR_MONGO_URI'); print('Connected!')"
```

### Application Crashes

**Restart the service**:
```bash
docker compose restart api
```

**Rebuild from scratch**:
```bash
docker compose down
docker compose build --no-cache
docker compose up -d
```

### View Container Details

```bash
# Inspect container
docker compose exec api env

# Access container shell
docker compose exec api sh

# Check Python version
docker compose exec api python --version
```

---

## Production Considerations

### Security

> [!CAUTION]
> Before deploying to production, ensure you address these security concerns:

1. **Strong Secrets**: Generate cryptographically secure values for `SECRET_KEY` and `API_KEY`
2. **Disable Debug Mode**: Set `DEBUG=False` in production
3. **HTTPS**: Use a reverse proxy (Nginx, Traefik) with SSL/TLS certificates
4. **Environment Variables**: Use secrets management (Docker Secrets, HashiCorp Vault)
5. **Network Isolation**: Use Docker networks to isolate services

### Performance

1. **Resource Limits**: Add resource constraints to prevent resource exhaustion
   ```yaml
   services:
     api:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
           reservations:
             cpus: '1'
             memory: 1G
   ```

2. **Logging**: Configure log rotation to prevent disk space issues
3. **Monitoring**: Integrate with monitoring tools (Prometheus, Grafana)

### Scaling

For horizontal scaling, use Docker Swarm or Kubernetes:

```bash
# Scale to 3 replicas
docker compose up -d --scale api=3
```

> [!NOTE]
> Ensure your MongoDB instance can handle multiple connections when scaling.

### Backup Strategy

1. **Database Backups**: Regularly backup MongoDB data
2. **Configuration Backups**: Version control your `.env.example` and `docker-compose.yml`
3. **Disaster Recovery**: Document recovery procedures

---

## Useful Commands

### Managing the Application

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# Restart services
docker compose restart

# View logs
docker compose logs -f

# Rebuild and restart
docker compose up -d --build

# Remove everything (including volumes)
docker compose down -v
```

### Updating the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose up -d --build

# View updated logs
docker compose logs -f api
```

### Cleaning Up

```bash
# Remove stopped containers
docker compose down

# Remove images
docker compose down --rmi all

# Remove volumes (WARNING: deletes data)
docker compose down -v

# Clean up Docker system
docker system prune -a
```

---

## Cloud Deployment (Google Cloud Run)

The application is also configured for deployment to Google Cloud Run using the same Docker Compose configuration:

```bash
# Deploy to Cloud Run
gcloud beta run compose up --project=your-project-id
```

For detailed Cloud Run deployment instructions, refer to the GitHub Actions workflow in `.github/workflows/`.

---

## Support

For issues or questions:
- Check the [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture details
- Review application logs: `docker compose logs -f`
- Check the [CHANGELOG.md](CHANGELOG.md) for recent changes

---

**Application Name**: CityHunter Backend API  
**Service Name**: `cityhunter-api` (or `api` in docker-compose.yml)  
**Default Port**: 8080  
**Documentation**: http://localhost:8080/docs
