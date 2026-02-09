@echo off
setlocal

echo This script helps you create a Google Cloud Service Account and generate a key for GitHub Actions.
echo.

:: Ask for Project ID
set /p PROJECT_ID="Enter your Google Cloud Project ID (e.g., my-project-12345): "

if "%PROJECT_ID%"=="" (
    echo Project ID is required.
    exit /b 1
)

set SA_NAME=github-actions-deployer
set SA_EMAIL=%SA_NAME%^@%PROJECT_ID%.iam.gserviceaccount.com
set KEY_FILE=gcp_sa_key.json

echo.
echo Creating Service Account: %SA_NAME%...
call gcloud iam service-accounts create %SA_NAME% ^
    --display-name="GitHub Actions Deployer" ^
    --project=%PROJECT_ID%
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [INFO] Service account might already exist. Continuing...
)

echo.
echo Assigning roles to %SA_EMAIL%...
echo Assigning roles/run.admin...
call gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SA_EMAIL%" --role="roles/run.admin" >nul
echo Assigning roles/iam.serviceAccountUser...
call gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SA_EMAIL%" --role="roles/iam.serviceAccountUser" >nul
echo Assigning roles/cloudbuild.builds.editor...
call gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SA_EMAIL%" --role="roles/cloudbuild.builds.editor" >nul
echo Assigning roles/storage.admin...
call gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SA_EMAIL%" --role="roles/storage.admin" >nul
echo Assigning roles/artifactregistry.admin...
call gcloud projects add-iam-policy-binding %PROJECT_ID% --member="serviceAccount:%SA_EMAIL%" --role="roles/artifactregistry.admin" >nul

echo.
echo Generating key file: %KEY_FILE%...
call gcloud iam service-accounts keys create %KEY_FILE% ^
    --iam-account=%SA_EMAIL% ^
    --project=%PROJECT_ID%

if %ERRORLEVEL% NEQ 0 (
    echo Failed to create key.
    pause
    exit /b 1
)

echo.
echo ========================================================
echo SUCCESS! Key saved to: %~dp0%KEY_FILE%
echo.
echo Copy the full content of this file and paste it into
echo your GitHub Repository Secrets as GCP_SA_KEY.
echo.
echo You can open it now by typing: notepad %KEY_FILE%
echo ========================================================
pause
