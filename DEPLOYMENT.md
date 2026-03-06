# 🚀 AgriConnect Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (frontend hosting)
- Railway account (backend hosting)
- Supabase project (already set up)

---

## 📋 DEPLOYMENT CHECKLIST

### **Step 1: Prepare Your Code**

- [ ] Commit all changes to Git
- [ ] Push to GitHub repository
- [ ] Ensure `.env` files are in `.gitignore`

### **Step 2: Deploy Backend (Railway)**

**2.1 Setup Railway Project:**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Set root directory: `aggriconnect/backend`

**2.2 Add Environment Variables:**

````
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SECRET_KEY=generate-a-strong-random-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440


























































































































































































- API Docs: `https://your-backend.railway.app/api/v1/docs`- Backend API: `https://your-backend.railway.app`- Frontend: `https://your-app.vercel.app`**Share your URLs:**Your AgriConnect app is now deployed and accessible worldwide!## 🎉 YOU'RE LIVE!---- [ ] Performance monitoring (Vercel Analytics)- [ ] Analytics setup (Google Analytics, Mixpanel)- [ ] Error tracking setup (Sentry, LogRocket)- [ ] Database backups enabled in Supabase- [ ] SSL certificates active (auto with Vercel/Railway)- [ ] Custom domain configured (optional)## 📝 POST-DEPLOYMENT CHECKLIST---- Push to `dev` branch → Deploy to preview/staging- Push to `main` branch → Auto-deploys to productionBoth Vercel and Railway support automatic deployments:## 🔄 CONTINUOUS DEPLOYMENT---- **Total: ~$65/month**- Supabase Pro: $25/month- Railway Pro: $20/month- Vercel Pro: $20/month**Production Tier:**- **Total: ~$5/month**- Supabase: Free (500MB database, 1GB storage)- Railway: $5/month (500 hours)- Vercel: Free (100GB bandwidth/month)**Free Tier (Hobby Projects):**## 💰 COST ESTIMATE---- Solution: Redeploy after adding environment variables**Issue: Environment variables not working**- Solution: Check Railway logs for backend errors**Issue: 502 Bad Gateway**- Solution: Verify `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in Railway**Issue: Database connection failed**- Solution: Add production URLs to Google Cloud Console authorized origins**Issue: Google OAuth not working**- Solution: Add frontend URL to `CORS_ORIGINS` in Railway**Issue: CORS errors**## 🐛 TROUBLESHOOTING---- View in Supabase dashboard → Logs**Supabase Logs:**- View in Vercel dashboard → Your project → Deployments**Vercel Logs:**- View in Railway dashboard → Your project → Deployments**Railway Logs:**## 📊 MONITORING & LOGS---5. **Use Supabase Row Level Security (RLS)** for database4. **Restrict CORS** to your actual frontend domain3. **Enable HTTPS only** in production   ```   print(secrets.token_urlsafe(32))   import secrets   ```python2. **Use strong SECRET_KEY** - Generate with:1. **Never commit `.env` files** to GitHub## ⚠️ IMPORTANT SECURITY NOTES---- Deploy using `gcloud run deploy`- Create `Dockerfile` in backend folder**Google Cloud Run:**```fly deployfly launch```bash**Fly.io:**- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`- Build command: `pip install -r requirements.txt`**Render (Free Tier):**### Backend Alternatives:- Output directory: `dist`- Build command: `npm run build`- Connect GitHub**Cloudflare Pages:**```# Drag 'dist' folder to netlify.com/dropnpm run buildcd aggriconnect/frontend```bash**Netlify:**### Frontend Alternatives:## 🔧 ALTERNATIVE HOSTING OPTIONS---- [ ] Farmer dashboard displays correctly- [ ] Order creation works- [ ] Cart operations work- [ ] Products load correctly- [ ] Google OAuth login works- [ ] Backend health check: `https://your-backend-url.railway.app/health`- [ ] Frontend loads correctly### **Step 6: Test Your Deployment**3. Redeploy backend   ```   https://your-frontend-url.vercel.app   ```2. Update `CORS_ORIGINS` environment variable:1. Go to Railway project settings### **Step 5: Update CORS in Backend**   ```   https://your-frontend-url.vercel.app/login   https://your-frontend-url.vercel.app   ```5. Add to "Authorized redirect URIs":   ```   https://your-frontend-url.vercel.app   ```4. Add to "Authorized JavaScript origins":3. Edit your OAuth 2.0 Client ID2. Navigate to: APIs & Services → Credentials1. Go to [Google Cloud Console](https://console.cloud.google.com/)### **Step 4: Update Google OAuth Credentials**- Get your Vercel URL: `https://your-app.vercel.app`- Wait for build to complete- Click "Deploy"**3.3 Deploy:**```VITE_GEMINI_API_KEY=your-gemini-api-keyVITE_SUPABASE_ANON_KEY=your-supabase-anon-keyVITE_SUPABASE_URL=https://your-project.supabase.coVITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.comVITE_API_URL=https://your-backend-url.railway.app/api/v1```**3.2 Add Environment Variables:**5. Framework Preset: `Vite`4. Set root directory: `aggriconnect/frontend`3. Import your GitHub repository2. Click "Add New..." → "Project"1. Go to [vercel.com](https://vercel.com)**3.1 Setup Vercel Project:**### **Step 3: Deploy Frontend (Vercel)**- Copy this URL (you'll need it for frontend)- Railway will provide: `https://your-app.railway.app`CORS_ORIGINS=https://your-frontend-url.vercel.app,https://www.your-domain.com
````

**2.3 Get Backend URL:**
