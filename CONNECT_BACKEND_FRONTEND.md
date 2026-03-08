# 🔗 Connect Backend to Frontend, OAuth & CORS

## ✅ Your Backend is Live!

**Backend URL:** `https://aggriconnect12.onrender.com`

Now you need to connect it to your frontend and configure OAuth.

---

## 📋 STEP-BY-STEP CONNECTION GUIDE

### **STEP 1: Update Render CORS Settings** 🔐

Your backend needs to allow requests from your frontend.

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click on:** `aggriconnect12` (your backend service)
3. **Left sidebar:** Click **"Environment"**
4. **Find:** `CORS_ORIGINS` variable
5. **Click "Edit"** and update the value to include your frontend URL:

   ```
   https://your-frontend-name.vercel.app,http://localhost:3000,http://localhost:5173
   ```

   ⚠️ **For now, if you haven't deployed frontend yet, add:**

   ```
   http://localhost:3000,http://localhost:5173
   ```

6. **Click "Save Changes"** (Render will auto-redeploy)

---

### **STEP 2: Deploy Frontend to Vercel** 🚀

#### **2.1 Go to Vercel:**

- Visit: https://vercel.com
- Sign in with GitHub

#### **2.2 Import Project:**

- Click **"Add New..."** → **"Project"**
- Find your `agriconnect` repository
- Click **"Import"**

#### **2.3 Configure Project:**

- **Framework Preset:** Vite
- **Root Directory:** Click **"Edit"** → Select **`frontend`**
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)

#### **2.4 Add Environment Variables:**

Click **"Environment Variables"** and add these:

```
Key:   VITE_API_URL
Value: https://aggriconnect12.onrender.com/api/v1
```

```
Key:   VITE_GOOGLE_CLIENT_ID
Value: your-google-client-id.apps.googleusercontent.com
```

```
Key:   VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co
```

```
Key:   VITE_SUPABASE_ANON_KEY
Value: your-supabase-anon-key
```

```
Key:   VITE_GEMINI_API_KEY
Value: your-gemini-api-key (if you have one)
```

#### **2.5 Deploy:**

- Click **"Deploy"**
- Wait 2-3 minutes
- You'll get a URL like: `https://your-app-name.vercel.app`

---

### **STEP 3: Update Google OAuth Settings** 🔑

Your Google OAuth needs to know about production URLs.

#### **3.1 Go to Google Cloud Console:**

- Visit: https://console.cloud.google.com/
- Select your project

#### **3.2 Navigate to Credentials:**

- **Left Menu:** APIs & Services → **Credentials**
- Click on your **OAuth 2.0 Client ID**

#### **3.3 Update Authorized JavaScript origins:**

Add these URLs (keep existing ones too):

```
Backend:
https://aggriconnect12.onrender.com

Frontend:
https://your-frontend-name.vercel.app

Local (for testing):
http://localhost:3000
http://localhost:5173
```

#### **3.4 Update Authorized redirect URIs:**

Add these:

```
Frontend production:
https://your-frontend-name.vercel.app
https://your-frontend-name.vercel.app/login

Backend:
https://aggriconnect12.onrender.com/api/v1/auth/google/callback

Local:
http://localhost:3000
http://localhost:5173
```

#### **3.5 Save:**

- Click **"Save"** at the bottom

---

### **STEP 4: Update Render CORS with Vercel URL** 🔄

Once you have your Vercel URL:

1. **Go back to Render:** https://dashboard.render.com/
2. **Click:** `aggriconnect12`
3. **Environment** tab
4. **Edit:** `CORS_ORIGINS` variable
5. **Update to:**
   ```
   https://your-frontend-name.vercel.app,http://localhost:3000,http://localhost:5173
   ```
6. **Save** (auto-redeploys)

---

### **STEP 5: Test Everything** ✅

#### **Test Backend (Already Working):**

1. **Health Check:**

   ```
   https://aggriconnect12.onrender.com/health
   ```

   Should return: `{"status":"healthy"}` ✅

2. **API Docs:**
   ```
   https://aggriconnect12.onrender.com/api/v1/docs
   ```
   Should show: Swagger UI ✅

#### **Test Frontend (After Vercel Deploy):**

1. Visit: `https://your-frontend-name.vercel.app`
2. Click "Login with Google"
3. Should redirect to Google OAuth
4. After login, should redirect back to your app
5. Try browsing products
6. Add items to cart
7. Create an order

---

## 📝 QUICK REFERENCE

### **Your URLs:**

```
Backend:  https://aggriconnect12.onrender.com
Frontend: https://your-app-name.vercel.app (after deploy)
API Docs: https://aggriconnect12.onrender.com/api/v1/docs
```

### **Environment Variables Summary:**

#### **Vercel (Frontend):**

```
VITE_API_URL=https://aggriconnect12.onrender.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_GEMINI_API_KEY=your-gemini-key
```

#### **Render (Backend):**

```
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SECRET_KEY=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
ACCESS_TOKEN_EXPIRE_MINUTES=1440
PYTHON_VERSION=3.11.9
```

---

## ⚠️ TROUBLESHOOTING

### **Issue: CORS errors in browser console**

```
Access to fetch at 'https://aggriconnect12.onrender.com' has been blocked by CORS policy
```

**Solution:**

- Verify `CORS_ORIGINS` in Render includes your Vercel URL
- Must be exact: `https://your-app.vercel.app` (no trailing slash)
- Redeploy backend after changing

---

### **Issue: Google OAuth shows "redirect_uri_mismatch"**

```
Error 400: redirect_uri_mismatch
```

**Solution:**

- Check Google Cloud Console → Credentials
- Vercel URL must be in "Authorized redirect URIs"
- Format: `https://your-app.vercel.app` exactly

---

### **Issue: API calls fail with 404**

**Solution:**

- Verify `VITE_API_URL` in Vercel ends with `/api/v1`
- Correct: `https://aggriconnect12.onrender.com/api/v1`
- Wrong: `https://aggriconnect12.onrender.com` ❌

---

### **Issue: Backend returns 500 errors**

**Check Render Logs:**

1. Go to Render → Your Service
2. Click "Logs" tab
3. Look for Python errors
4. Common issues:
   - Missing environment variables
   - Database connection failed
   - Invalid SECRET_KEY

---

## 🎯 CHECKLIST BEFORE GOING LIVE

- [ ] Backend deployed to Render: ✅ `https://aggriconnect12.onrender.com`
- [ ] Backend health check works
- [ ] Frontend deployed to Vercel
- [ ] VITE_API_URL points to Render backend
- [ ] CORS_ORIGINS in Render includes Vercel URL
- [ ] Google OAuth updated with both URLs
- [ ] Test login flow
- [ ] Test API calls (products, cart, orders)
- [ ] Test farmer and consumer flows

---

## 🚀 YOU'RE ALMOST THERE!

**Next Steps:**

1. ✅ Backend is deployed (DONE!)
2. 🟡 Deploy frontend to Vercel (DO NOW)
3. 🟡 Update CORS_ORIGINS with Vercel URL
4. 🟡 Update Google OAuth
5. ✅ Test everything

**Follow the steps above and you'll be fully deployed in minutes!** 🎉
