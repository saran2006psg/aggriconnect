# 🚀 Deploy AgriConnect Backend to Render - Complete Guide

## ✅ Prerequisites

- [x] GitHub repository: `https://github.com/saran2006psg/aggriconnect`
- [x] Code pushed to GitHub
- [x] Supabase project ready
- [x] Google OAuth credentials

---

## 📋 STEP-BY-STEP DEPLOYMENT

### **Step 1: Create Render Account**

1. Go to: https://render.com
2. Click **"Get Started"** or **"Sign Up"**
3. Choose **"Sign in with GitHub"**
4. Authorize Render to access your GitHub account

---

### **Step 2: Create New Web Service**

1. **Dashboard** → Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Next"**

---

### **Step 3: Connect Your Repository**

1. If first time:
   - Click **"Configure Account"**
   - Select **"Only select repositories"**
   - Choose **"agriconnect"**
   - Click **"Install & Authorize"**

2. Find your repository:
   - Search for: `agriconnect`
   - Click **"Connect"** button next to it

---

### **Step 4: Configure Service Settings**

Fill in these EXACT settings:

#### **Basic Settings:**

| Setting            | Value                                                  |
| ------------------ | ------------------------------------------------------ |
| **Name**           | `agriconnect-backend`                                  |
| **Region**         | `Oregon (US West)` or closest to you                   |
| **Branch**         | `main`                                                 |
| **Root Directory** | `backend` ⚠️ **IMPORTANT: NOT "aggriconnect/backend"** |
| **Runtime**        | `Python 3` (will be auto-detected)                     |

#### **Build & Deploy:**

| Setting           | Value                                          |
| ----------------- | ---------------------------------------------- |
| **Build Command** | `pip install -r requirements.txt`              |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |

#### **Instance Type:**

- Select: **Free** (or paid if you need always-on service)

---

### **Step 5: Add Environment Variables** ⚠️ **CRITICAL**

Scroll down to **"Environment Variables"** section.

Click **"Add Environment Variable"** and add ALL of these:

#### **Python Version (MOST IMPORTANT):**

```
Key:   PYTHON_VERSION
Value: 3.11.9
```

#### **Supabase Configuration:**

```
Key:   SUPABASE_URL
Value: https://your-project-id.supabase.co

Key:   SUPABASE_KEY
Value: your-supabase-anon-key

Key:   SUPABASE_SERVICE_KEY
Value: your-supabase-service-role-key
```

#### **JWT Secret:**

```
Key:   SECRET_KEY
Value: [Generate using: python -c "import secrets; print(secrets.token_urlsafe(32))"]
```

#### **Google OAuth:**

```
Key:   GOOGLE_CLIENT_ID
Value: your-google-client-id.apps.googleusercontent.com

Key:   GOOGLE_CLIENT_SECRET
Value: your-google-client-secret
```

#### **Other Settings:**

```
Key:   ACCESS_TOKEN_EXPIRE_MINUTES
Value: 1440

Key:   CORS_ORIGINS
Value: http://localhost:3000
       (You'll update this with your Vercel URL later)
```

---

### **Step 6: Create Web Service**

1. **BEFORE clicking "Create Web Service"**, verify:
   - ✅ Root Directory is `backend`
   - ✅ Build Command is `pip install -r requirements.txt`
   - ✅ Start Command is `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - ✅ **PYTHON_VERSION=3.11.9** is added
   - ✅ All environment variables are added

2. Click **"Create Web Service"**

3. **Wait 5-10 minutes** for initial deployment

---

### **Step 7: Monitor Deployment**

Watch the build logs:

✅ **Look for these SUCCESS indicators:**

```
==> Using Python version 3.11.9 (from environment variable)
==> Running build command 'pip install -r requirements.txt'...
Successfully installed fastapi-0.109.0 uvicorn-0.27.0 ...
==> Build successful!
==> Starting service with 'uvicorn main:app --host 0.0.0.0 --port $PORT'...
Application startup complete.
```

❌ **Watch out for ERRORS:**

```
==> Using Python version 3.14.3 (default)  ← WRONG! PYTHON_VERSION not set
× Preparing metadata (pyproject.toml) did not run successfully  ← Compilation error
pydantic-core  ← This means Python 3.14 is being used
```

---

### **Step 8: Test Your Backend**

Once deployed, you'll get a URL like: `https://agriconnect-backend-xxxx.onrender.com`

**Test these endpoints:**

1. **Health Check:**

   ```
   https://your-backend-url.onrender.com/health
   ```

   Should return: `{"status":"healthy"}`

2. **Root Endpoint:**

   ```
   https://your-backend-url.onrender.com/
   ```

   Should return: API welcome message with version

3. **API Documentation:**
   ```
   https://your-backend-url.onrender.com/api/v1/docs
   ```
   Should show: Interactive Swagger UI

---

## 🔧 TROUBLESHOOTING

### **Issue 1: Still using Python 3.14**

**Symptoms:**

```
Using Python version 3.14.3 (default)
pydantic-core compilation failed
```

**Solution:**

1. Go to your service → **Environment** tab
2. Verify `PYTHON_VERSION=3.11.9` exists
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

---

### **Issue 2: Build failed - pydantic-core error**

**Solution:**
This means Python 3.14 is being used. Follow Issue 1 solution above.

---

### **Issue 3: Application failed to respond**

**Check Logs:**

1. Click **"Logs"** tab in Render
2. Look for Python errors
3. Verify all environment variables are set correctly

**Common causes:**

- Missing `SUPABASE_URL` or `SUPABASE_SERVICE_KEY`
- Wrong `SECRET_KEY` format
- Database connection issues

---

### **Issue 4: CORS errors when testing from frontend**

**Solution:**

1. Go to **Environment** tab
2. Find `CORS_ORIGINS` variable
3. Update to include your frontend URL:
   ```
   https://your-frontend.vercel.app,http://localhost:3000
   ```
4. Save (auto-redeploys)

---

## ✅ POST-DEPLOYMENT CHECKLIST

After successful deployment:

- [ ] Backend URL works: `https://your-backend.onrender.com/health`
- [ ] API docs accessible: `https://your-backend.onrender.com/api/v1/docs`
- [ ] Copy backend URL for frontend configuration
- [ ] Update Google OAuth authorized URIs (if using OAuth)
- [ ] Update CORS_ORIGINS with frontend URL
- [ ] Test API endpoints from Postman/Thunder Client

---

## 📝 IMPORTANT NOTES

### **Free Tier Limitations:**

- ⏰ **Spins down after 15 minutes** of inactivity
- 🐌 **Cold start:** First request takes 30-60 seconds
- 💾 **750 hours/month** (enough for testing/hobby projects)

### **Upgrade to Paid ($7/month) for:**

- ✅ Always-on service (no spin-down)
- ✅ Faster response times
- ✅ More resources

---

## 🔄 CONTINUOUS DEPLOYMENT

Render automatically redeploys when you push to GitHub:

```powershell
# Make changes to your code
cd D:\AGRI\aggriconnect
git add .
git commit -m "Update backend"
git push origin main
```

Render will:

1. Detect the push
2. Automatically start new deployment
3. Deploy in ~3-5 minutes

---

## 🎯 NEXT STEPS

1. **Copy your Render backend URL**
2. **Deploy frontend to Vercel** (see DEPLOY_WEB_GUIDE.md)
3. **Update frontend VITE_API_URL** with Render URL
4. **Update Google OAuth** authorized origins
5. **Test complete flow**

---

## 🆘 NEED HELP?

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Check Logs:** Your Service → Logs tab
- **Support:** support@render.com

---

## ✨ SUCCESS!

Your backend is now live at:

```
https://your-backend-name.onrender.com
```

API Documentation:

```
https://your-backend-name.onrender.com/api/v1/docs
```

🎉 **Congratulations! Your AgriConnect backend is deployed!**
