param(
  [string]$ProjectId = $env:GOOGLE_CLOUD_PROJECT,
  [string]$Region = "us-central1",
  [string]$Repository = "fantasy-agent",
  [string]$Service = "fantasy-agent",
  [string]$GeminiSecret = $env:GEMINI_API_KEY_SECRET
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  throw "Set GOOGLE_CLOUD_PROJECT or pass -ProjectId."
}

$Image = "$Region-docker.pkg.dev/$ProjectId/$Repository/$Service"

gcloud artifacts repositories describe $Repository `
  --project=$ProjectId `
  --location=$Region *> $null
if ($LASTEXITCODE -ne 0) {
  gcloud artifacts repositories create $Repository `
    --project=$ProjectId `
    --repository-format=docker `
    --location=$Region `
    --description="Fantasy Agent container images"
}

gcloud builds submit . `
  --project=$ProjectId `
  --tag=$Image
if ($LASTEXITCODE -ne 0) {
  throw "Cloud Build failed."
}

$DeployArgs = @(
  "run", "deploy", $Service,
  "--project=$ProjectId",
  "--region=$Region",
  "--image=$Image",
  "--platform=managed",
  "--set-env-vars=GOOGLE_CLOUD_PROJECT=$ProjectId,BIGQUERY_DATASET=fantasy_engine,NODE_ENV=production",
  "--allow-unauthenticated"
)

if (-not [string]::IsNullOrWhiteSpace($GeminiSecret)) {
  $DeployArgs += "--set-secrets=GEMINI_API_KEY=$GeminiSecret`:latest"
} else {
  Write-Warning "GEMINI_API_KEY_SECRET is not set; deployment will require another Gemini key configuration."
}

gcloud @DeployArgs
if ($LASTEXITCODE -ne 0) {
  throw "Cloud Run deployment failed."
}
