# 🌐 Deploy AgriConnect - Vercel (Frontend) + Render (Backend)

## 📋 PREREQUISITES

- GitHub account
- Push your code to GitHub:
  ```powershell
  cd D:\AGRI\aggriconnect
  git init
  git add .
  git commit -m "Initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/agriconnect.git
  git push -u origin main
  ```

---

## 🎨 STEP 1: Deploy Frontend to Vercel (Web Interface)

### Option A: GitHub Integration (Recommended)

**1. Go to Vercel:**

- Visit: https://vercel.com
- Click "Sign Up" or "Login" → Choose "Continue with GitHub"

**2. Import Project:**

- Click "Add New..." → "Project"
- Click "Import Git Repository"
- Select your `agriconnect` repository
- Click "Import"

**3. Configure Project:**

- **Framework Preset:** Vite
- **Root Directory:** Click "Edit" → Select `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

**4. Add Environment Variables:**
Click "Environment Variables" and add these:

```
VITE_API_URL=https://your-backend-name.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-api-key
```

⚠️ **Note:** You'll update `VITE_API_URL` after deploying backend in Step 2

**5. Deploy:**

- Click "Deploy"
- Wait 2-3 minutes for build to complete
- Click on the deployment URL to view your live site!
- Your frontend will be at: `https://your-app-name.vercel.app`

---

### Option B: Drag & Drop (Quick & Simple)

**1. Build Your Frontend:**

```powershell
cd D:\AGRI\aggriconnect\frontend
npm run build
```

**2. Deploy to Vercel:**

- Visit: https://vercel.com/new
- Login with GitHub
- Drag the `dist` folder onto the page
- Wait for upload to complete
- Your site is live! 🎉

**3. Add Environment Variables:**

- Go to your project settings
- Click "Environment Variables"
- Add the same variables as Option A
- Redeploy: Settings → Deployments → Latest → "Redeploy"

---

## 🚀 STEP 2: Deploy Backend to Render

**1. Go to Render:**

- Visit: https://render.com
- Click "Get Started" or "Login" → Choose "GitHub"

**2. Create New Web Service:**

- Click "New +" → "Web Service"
- Click "Build and deploy from a Git repository" → "Next"
- Click "Configure Account" → Authorize Render to access your GitHub
- Select your `agriconnect` repository → "Connect"

**3. Configure Service:**

Fill in these details:

| Field              | Value                                          |
| ------------------ | ---------------------------------------------- |
| **Name**           | `agriconnect-backend` (or any name)            |
| **Region**         | Choose closest to you                          |
| **Branch**         | `main`                                         |
| **Root Directory** | `backend`                                      |
| **Runtime**        | `Python 3`                                     |
| **Build Command**  | `pip install -r requirements.txt`              |
| **Start Command**  | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type**  | `Free` (or paid if needed)                     |

**4. Add Environment Variables:**

Scroll down to "Environment Variables" section and click "Add Environment Variable":

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key
SECRET_KEY=generate-strong-random-key-here
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=https://your-app-name.vercel.app
```

**Generate a strong SECRET_KEY:**

```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

**5. Create Web Service:**

- Click "Create Web Service"
- Wait 5-10 minutes for initial deployment
- Your backend will be at: `https://your-backend-name.onrender.com`

**6. Test Your Backend:**

- Visit: `https://your-backend-name.onrender.com/health`
- Should return: `{"status":"healthy"}`

---

## 🔄 STEP 3: Connect Frontend to Backend

**1. Copy Your Render Backend URL:**

- Example: `https://agriconnect-backend.onrender.com`

**2. Update Vercel Environment Variables:**

- Go to Vercel Dashboard → Your Project
- Click "Settings" → "Environment Variables"
- Find `VITE_API_URL` and click "Edit"
- Update to: `https://your-backend-name.onrender.com/api/v1`
- Click "Save"

**3. Redeploy Frontend:**

- Go to "Deployments" tab
- Click "..." on latest deployment → "Redeploy"
- Wait for redeployment to complete

---

## 🔐 STEP 4: Update Google OAuth

**1. Go to Google Cloud Console:**

- Visit: https://console.cloud.google.com/
- Select your project

**2. Update Authorized Origins:**

- Go to: APIs & Services → Credentials
- Click on your OAuth 2.0 Client ID
- Add to "Authorized JavaScript origins":
  ```
  https://your-app-name.vercel.app
  ```

**3. Update Redirect URIs:**

- Add to "Authorized redirect URIs":
  ```
  https://your-app-name.vercel.app
  https://your-app-name.vercel.app/login
  ```
- Click "Save"

---

## 🔄 STEP 5: Update Backend CORS

**1. Go to Render Dashboard:**

- Select your backend service
- Click "Environment" in left sidebar

**2. Update CORS_ORIGINS:**

- Find `CORS_ORIGINS` variable
- Update value to: `https://your-app-name.vercel.app`
- Click "Save Changes"
- Backend will auto-redeploy

---

## ✅ STEP 6: Test Your Deployment

**Test Checklist:**

- [ ] Visit your Vercel frontend URL
- [ ] Frontend loads without errors
- [ ] Click "Login" → Google OAuth works
- [ ] Browse products (should load from backend)
- [ ] Add items to cart
- [ ] Create an order
- [ ] Check farmer dashboard

**Backend Health Check:**

- Visit: `https://your-backend-name.onrender.com/health`
- Should return: `{"status":"healthy"}`

**API Documentation:**

- Visit: `https://your-backend-name.onrender.com/api/v1/docs`
- Should show interactive API docs

---

## ⚠️ IMPORTANT NOTES

### Render Free Tier Limitations:

- ⏰ **Spins down after 15 mins of inactivity**
- 🐌 **First request after spin-down takes 30-60 seconds**
- 💾 **750 hours/month free** (enough for hobby projects)
- 💡 **Upgrade to paid ($7/mo) for always-on service**

### Vercel Free Tier:

- ✅ **100GB bandwidth/month**
- ✅ **Unlimited websites**
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**

---

## 🐛 TROUBLESHOOTING

**Issue: "Application failed to respond"**

- Solution: Check Render logs for errors
- Go to: Render Dashboard → Your Service → Logs

**Issue: CORS errors in browser console**

```
Access to fetch has been blocked by CORS policy
```

- Solution: Verify `CORS_ORIGINS` in Render matches your Vercel URL exactly
- Make sure it's `https://` not `http://`

**Issue: Google login shows error**

```
Error 400: redirect_uri_mismatch
```

- Solution: Add your Vercel URL to Google Cloud Console authorized URIs

**Issue: Backend returns 500 errors**

- Check Render logs for Python errors
- Verify all environment variables are set correctly

**Issue: Frontend shows "Failed to fetch"**

- Verify `VITE_API_URL` points to correct Render URL
- Check if backend is running (visit `/health` endpoint)

---

## 📊 YOUR LIVE URLS

After deployment, you'll have:

| Service          | URL                                             | Purpose                       |
| ---------------- | ----------------------------------------------- | ----------------------------- |
| **Frontend**     | `https://your-app.vercel.app`                   | User interface                |
| **Backend**      | `https://your-backend.onrender.com`             | API server                    |
| **API Docs**     | `https://your-backend.onrender.com/api/v1/docs` | Interactive API documentation |
| **Health Check** | `https://your-backend.onrender.com/health`      | Backend status                |

---

## 💰 COST BREAKDOWN

| Service   | Plan | Cost            |
| --------- | ---- | --------------- |
| Vercel    | Free | $0/month        |
| Render    | Free | $0/month        |
| Supabase  | Free | $0/month        |
| **TOTAL** |      | **$0/month** 🎉 |

**Upgrade Options:**

- Render Individual: $7/month (no sleep, better performance)
- Vercel Pro: $20/month (advanced features)
- Supabase Pro: $25/month (more storage)

---

## 🔄 CONTINUOUS DEPLOYMENT

### Automatic Updates:

Both Vercel and Render auto-deploy when you push to GitHub:

```powershell
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

- Vercel: Deploys in ~2 minutes
- Render: Deploys in ~5 minutes

### Check Deployment Status:

- Vercel: Dashboard → Deployments
- Render: Dashboard → Events

---

## 🎉 CONGRATULATIONS!

Your AgriConnect app is now live and accessible worldwide! 🌍

**Next Steps:**

1. Share your Vercel URL with users
2. Monitor logs for errors
3. Set up custom domain (optional)
4. Enable analytics (Vercel Analytics)
5. Set up error tracking (Sentry)

**Need Help?**

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Supabase Docs: https://supabase.com/docs
