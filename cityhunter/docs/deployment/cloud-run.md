# Frontend Deployment to Google Cloud Run

This document explains how to deploy the CityHunter frontend to Google Cloud Run using GitHub Actions.

## Automated Deployment (GitHub Actions)

The frontend automatically deploys to Google Cloud Run when code is pushed to the `main` branch.

### Required GitHub Secrets

Configure the following secrets in your GitHub repository settings (`Settings` → `Secrets and variables` → `Actions`):

| Secret Name | Description | Current Value (for reference) |
|-------------|-------------|-------------------------------|
| `GCP_SA_KEY` | Google Cloud Service Account JSON key | *(Same as backend)* |
| `API_BASE_KEY` | API key for backend authentication | `<auth_code>` |
| `BACKEND_API_URL` | Backend API URL | `<backend_url>` |

### Setting Up GCP Service Account

If you haven't already created a service account for the backend deployment:

1. **Create a Service Account**:
   ```bash
   gcloud iam service-accounts create github-actions \
     --display-name="GitHub Actions Deployer"
   ```

2. **Grant Required Permissions**:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/run.admin"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/storage.admin"
   
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/iam.serviceAccountUser"
   ```

3. **Create and Download Key**:
   ```bash
   gcloud iam service-accounts keys create key.json \
     --iam-account=github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com
   ```

4. **Add to GitHub Secrets**:
   - Copy the entire contents of `key.json`
   - Go to GitHub repository → Settings → Secrets and variables → Actions
   - Create new secret named `GCP_SA_KEY`
   - Paste the JSON content

### Manual Deployment

To deploy manually without GitHub Actions:

```bash
# Navigate to frontend directory
cd c:\Users\Lenovo\GIT\cityHunter\vibe\cityhunter

# Deploy to Cloud Run
gcloud run deploy cityhunter-frontend \
  --source . \
  --region europe-west9 \
  --allow-unauthenticated \
  --set-env-vars "API_BASE_KEY=<auth_code>" \
  --set-env-vars "BACKEND_API_URL=<backend_url>" \
  --set-env-vars "NODE_ENV=production" \
  --min-instances 0 \
  --cpu-boost
```

### Deployment Configuration

- **Service Name**: `cityhunter-frontend`
- **Region**: `europe-west9` (Paris)
- **Min Instances**: 0 (scales to zero when idle)
- **CPU Boost**: Enabled for faster cold starts
- **Authentication**: Unauthenticated (public access)

### After Deployment

1. **Get the Frontend URL**:
   ```bash
   gcloud run services describe cityhunter-frontend \
     --region europe-west9 \
     --format='value(status.url)'
   ```

2. **Update Backend CORS** (if needed):
   ```bash
   gcloud run services update hunterback \
     --region europe-west9 \
     --update-env-vars "BACKEND_CORS_ORIGINS=https://your-frontend-url.run.app"
   ```

3. **View Logs**:
   ```bash
   gcloud run services logs read cityhunter-frontend --region europe-west9
   ```

### Triggering Manual Deployment

You can manually trigger a deployment from GitHub:
1. Go to `Actions` tab in your repository
2. Select `CI/CD - Next.js Frontend Deploy to Cloud Run`
3. Click `Run workflow`
4. Select the branch and click `Run workflow`

## Environment Variables

The following environment variables are configured during deployment:

- `API_BASE_KEY`: Authentication key for backend API calls
- `BACKEND_API_URL`: Full URL to the backend API
- `NODE_ENV`: Set to `production` for optimized builds

## Troubleshooting

### Build Fails

Check the GitHub Actions logs for detailed error messages. Common issues:
- Missing or incorrect secrets
- GCP authentication failures
- Docker build errors

### Service Won't Start

```bash
# Check service logs
gcloud run services logs read cityhunter-frontend --region europe-west9 --limit=50

# Check service status
gcloud run services describe cityhunter-frontend --region europe-west9
```

### CORS Errors

Ensure the backend's `BACKEND_CORS_ORIGINS` includes your frontend URL.

## Cost Optimization

The deployment is configured to minimize costs:
- **Scale to Zero**: Service scales down to 0 instances when idle
- **CPU Boost**: Faster cold starts reduce billable time
- **Optimized Build**: Next.js standalone output reduces image size

Expected cost: **~$0/month** for low traffic (free tier eligible)
