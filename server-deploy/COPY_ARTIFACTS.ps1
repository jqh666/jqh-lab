$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$DeployDir = $PSScriptRoot

$BackendTarget = Join-Path $DeployDir "backend\app.jar"
$FrontendTarget = Join-Path $DeployDir "frontend\dist"

Write-Host "Copying backend jar..."
$Jar = Get-ChildItem -Path (Join-Path $Root "backend\target") -Filter "*.jar" |
  Where-Object { $_.Name -notlike "*sources*" } |
  Select-Object -First 1

if (-not $Jar) {
  throw "No jar found. Run: cd backend; mvn clean package -DskipTests"
}

Copy-Item $Jar.FullName $BackendTarget -Force

Write-Host "Copying frontend dist..."
$Dist = Join-Path $Root "frontend\dist"
if (-not (Test-Path $Dist)) {
  throw "frontend/dist not found. Run: cd frontend; npm run build"
}

if (Test-Path $FrontendTarget) {
  Remove-Item $FrontendTarget -Recurse -Force
}
Copy-Item $Dist $FrontendTarget -Recurse -Force

Write-Host "Done."
Write-Host "Upload with:"
Write-Host "scp -r .\server-deploy-118.195.205.69 root@118.195.205.69:/root/"
