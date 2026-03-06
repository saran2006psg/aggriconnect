# Quick Deployment Script for Railway + Vercel

Write-Host "🚀 AgriConnect Deployment Helper" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if Railway CLI is installed
Write-Host "Checking Railway CLI..." -ForegroundColor Yellow
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI not found. Installing..." -ForegroundColor Red
    npm install -g @railway/cli
}
else {
    Write-Host "✅ Railway CLI found" -ForegroundColor Green
}

# Check if Vercel CLI is installed
Write-Host "Checking Vercel CLI..." -ForegroundColor Yellow
if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}
else {
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
}

Write-Host ""
Write-Host "Choose deployment option:" -ForegroundColor Cyan
Write-Host "1. Deploy Backend (Railway)" -ForegroundColor White
Write-Host "2. Deploy Frontend (Vercel)" -ForegroundColor White
Write-Host "3. Deploy Both" -ForegroundColor White
Write-Host "4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "📦 Deploying Backend to Railway..." -ForegroundColor Yellow
        Set-Location -Path ".\aggriconnect\backend"
        railway login
        railway up
        Write-Host "✅ Backend deployed!" -ForegroundColor Green
        Write-Host "⚠️ Don't forget to add environment variables in Railway dashboard" -ForegroundColor Yellow
    }
    "2" {
        Write-Host ""
        Write-Host "📦 Deploying Frontend to Vercel..." -ForegroundColor Yellow
        Set-Location -Path ".\aggriconnect\frontend"
        vercel --prod
        Write-Host "✅ Frontend deployed!" -ForegroundColor Green
        Write-Host "⚠️ Don't forget to add environment variables in Vercel dashboard" -ForegroundColor Yellow
    }
    "3" {
        Write-Host ""
        Write-Host "📦 Deploying Backend to Railway..." -ForegroundColor Yellow
        Set-Location -Path ".\aggriconnect\backend"
        railway login
        railway up
        
        Write-Host ""
        Write-Host "📦 Deploying Frontend to Vercel..." -ForegroundColor Yellow
        Set-Location -Path "..\frontend"
        vercel --prod
        
        Write-Host ""
        Write-Host "✅ Both deployed!" -ForegroundColor Green
        Write-Host "⚠️ Don't forget to add environment variables in both dashboards" -ForegroundColor Yellow
    }
    "4" {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 View full deployment guide: DEPLOYMENT.md" -ForegroundColor Cyan
