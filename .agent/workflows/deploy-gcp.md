---
description: Deploy the application to Google Cloud Platform
---

# Deploy to GCP

This workflow deploys the CityHunter application to Google Cloud Run.

## Prerequisites
- Google Cloud SDK (`gcloud`) installed and configured
- Project ID configured in GCP
- Service account with necessary permissions
- GitHub Actions secrets configured (for CI/CD)

## Manual Deployment

### 1. Authenticate with GCP
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Deploy Backend
```bash
cd hunterBack
gcloud beta run compose up --project YOUR_PROJECT_ID
```

### 3. Deploy Frontend
```bash
cd cityhunter
gcloud beta run compose up --project YOUR_PROJECT_ID
```

## CI/CD Deployment

The application uses GitHub Actions for automated deployment.

### Required GitHub Secrets
- `GCP_PROJECT_ID`: Your Google Cloud project ID
- `GCP_SA_KEY`: Service account JSON key
- `API_KEY`: Application API key
- `MONGODB_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Google Gemini API key

### Trigger Deployment
Push to the `main` branch or create a pull request to trigger the deployment workflow.

## Verify Deployment

After deployment, check:
1. Cloud Run services are running
2. Environment variables are set correctly
3. Application is accessible via the provided URL
4. Health checks are passing

See [hunterBack/DEPLOYMENT.md](../../hunterBack/DEPLOYMENT.md) for detailed deployment documentation.
