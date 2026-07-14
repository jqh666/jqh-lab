param(
  [string]$ReleaseName = "jqh-lab-release"
)

$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$ReleaseRoot = Join-Path $Root "release"
$ReleaseDir = Join-Path $ReleaseRoot $ReleaseName

Write-Host "==> Cleaning release directory"
if (Test-Path $ReleaseDir) {
  Remove-Item $ReleaseDir -Recurse -Force
}
New-Item -ItemType Directory -Force -Path (Join-Path $ReleaseDir "backend") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $ReleaseDir "frontend") | Out-Null

Write-Host "==> Building backend jar"
Push-Location (Join-Path $Root "backend")
mvn clean package -DskipTests
$Jar = Get-ChildItem -Path "target" -Filter "*.jar" | Where-Object { $_.Name -notlike "*sources*" } | Select-Object -First 1
if (-not $Jar) {
  throw "Backend jar not found under backend/target."
}
Copy-Item $Jar.FullName (Join-Path $ReleaseDir "backend\app.jar") -Force
Pop-Location

Write-Host "==> Building frontend dist"
Push-Location (Join-Path $Root "frontend")
if (-not (Test-Path "node_modules")) {
  npm ci
}
npm run build
Copy-Item "dist" (Join-Path $ReleaseDir "frontend\dist") -Recurse -Force
Pop-Location

Write-Host "==> Copying server deployment files"
Copy-Item (Join-Path $PSScriptRoot "server\deploy.sh") (Join-Path $ReleaseDir "deploy.sh") -Force
Copy-Item (Join-Path $PSScriptRoot "SERVER_CONFIG.md") (Join-Path $ReleaseDir "SERVER_CONFIG.md") -Force
Copy-Item (Join-Path $PSScriptRoot "ONE_CLICK_DEPLOY.md") (Join-Path $ReleaseDir "ONE_CLICK_DEPLOY.md") -Force

Write-Host "==> Creating archive"
$TarPath = Join-Path $ReleaseRoot "$ReleaseName.tar.gz"
if (Test-Path $TarPath) {
  Remove-Item $TarPath -Force
}
tar -czf $TarPath -C $ReleaseRoot $ReleaseName

Write-Host ""
Write-Host "Release package created:"
Write-Host $TarPath
Write-Host ""
Write-Host "Upload it to your server, then run:"
Write-Host "tar -xzf $ReleaseName.tar.gz && cd $ReleaseName && sudo bash deploy.sh"
