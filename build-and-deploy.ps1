# Build and Deploy Script for Cloudflare Pages
Write-Host "Building React app..." -ForegroundColor Cyan
Set-Location "resume-rewriter"
pnpm build
Set-Location ..

Write-Host "Deploying to Cloudflare Pages..." -ForegroundColor Cyan
Write-Host "Static files: resume-rewriter/dist" -ForegroundColor Yellow
Write-Host "Functions: functions/" -ForegroundColor Yellow

npx wrangler pages deploy resume-rewriter/dist --project-name=ai-resume-editor

Write-Host "Deployment complete!" -ForegroundColor Green

