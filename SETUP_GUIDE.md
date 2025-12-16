# 🚀 AgriConnect - Complete Setup Guide

This guide will walk you through setting up the complete AgriConnect platform from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Supabase Account** (Free tier available at [supabase.com](https://supabase.com))
- **Google Gemini API Key** (Optional, for AI features)

---

## 🗄️ Step 1: Set Up Supabase Database

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **"New Project"**
4. Fill in:
   - **Name:** `aggriconnect`
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
   - Click **"Create new project"**

### 1.2 Get API Credentials

Once your project is created:

1. Go to **Settings** → **API**
2. Note down these values:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

⚠️ **Important:** Never commit the service_role key to version control!

### 1.3 Run Database Migration

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy the entire contents of `backend/app/database/migrations.sql`
4. Paste into the SQL editor
5. Click **"Run"**
6. Verify all tables are created in the **Table Editor**

Expected tables:
- users
- farmer_profiles
- products
- reviews
- carts
- cart_items
- orders
- order_items
- subscriptions
- wallets
- wallet_transactions
- admin_analytics

---

## 🔧 Step 2: Set Up Backend (Python FastAPI)

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Create Virtual Environment

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

### 2.4 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and update with your credentials:

```env
# Supabase (from Step 1.2)
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database (optional, Supabase handles this)
DATABASE_URL=

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15
REFRESH_TOKEN_EXPIRATION_DAYS=7

# CORS (allow frontend to access backend)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Environment
ENVIRONMENT=development

# API Configuration
API_V1_PREFIX=/api/v1
PROJECT_NAME=AgriConnect Backend
VERSION=1.0.0

# Platform Commission (percentage)
PLATFORM_COMMISSION_RATE=12.5
```

**Generate a secure JWT secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2.5 Start Backend Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the run script:
```bash
chmod +x run.sh
./run.sh
```

### 2.6 Verify Backend is Running

Open your browser and visit:

- **API Health Check:** http://localhost:8000/health
- **Interactive API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

You should see the API documentation and be able to test endpoints!

---

## 🎨 Step 3: Set Up Frontend (React TypeScript)

### 3.1 Navigate to Frontend Directory

Open a **new terminal** (keep backend running):

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

Or with yarn:
```bash
yarn install
```

### 3.3 Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Google Gemini API Key (Optional for AI features)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Backend API URL
VITE_API_URL=http://localhost:8000/api/v1
```

**To get Gemini API Key (optional):**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Paste it in `.env`

### 3.4 Start Frontend Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

### 3.5 Access the Application

Open your browser and visit: **http://localhost:5173**

You should see the AgriConnect onboarding page! 🎉

---

## 🧪 Step 4: Test the Application

### 4.1 Create Test Accounts

1. **Create Admin Account:**
   - Go to http://localhost:5173
   - Click "Admin" on onboarding
   - Register with email & password
   - You can manually update the role to 'admin' in Supabase

2. **Create Farmer Account:**
   - Register as "Farmer"
   - Use email: `farmer@test.com`
   - Password: `farmer123`

3. **Create Consumer Account:**
   - Register as "Consumer"
   - Use email: `consumer@test.com`
   - Password: `consumer123`

### 4.2 Test Workflows

**As Farmer:**
1. Login as farmer
2. Add products
3. View orders
4. Check wallet

**As Consumer:**
1. Login as consumer
2. Browse products
3. Add to cart
4. Checkout
5. Track orders

**As Admin:**
1. Login as admin
2. View analytics dashboard
3. Manage users

---

## 🐳 Step 5: Docker Setup (Optional)

### 5.1 Backend with Docker

```bash
cd backend
docker-compose up --build
```

### 5.2 Frontend (still needs Node.js)

```bash
cd frontend
npm run dev
```

---

## 🔍 Step 6: Verify Everything Works

### ✅ Backend Checklist

- [ ] Backend running on http://localhost:8000
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Health check returns `{"status": "healthy"}`
- [ ] Can register a new user via API
- [ ] Can login and receive JWT token

### ✅ Frontend Checklist

- [ ] Frontend running on http://localhost:5173
- [ ] Can access onboarding page
- [ ] Can register new accounts
- [ ] Can login successfully
- [ ] Navigation works between pages

### ✅ Integration Checklist

- [ ] Frontend can communicate with backend
- [ ] Authentication works end-to-end
- [ ] Products display from database
- [ ] Cart functionality works
- [ ] Orders can be created

---

## 🐛 Troubleshooting

### Backend Issues

**Error: `ModuleNotFoundError: No module named 'app'`**
```bash
# Make sure you're in the backend directory
cd backend
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

**Error: `Could not connect to Supabase`**
- Verify SUPABASE_URL and SUPABASE_KEY in `.env`
- Check your internet connection
- Ensure Supabase project is active

**Error: `JWT token invalid`**
- Clear browser cookies/localStorage
- Re-login to get new token
- Verify JWT_SECRET is set in `.env`

### Frontend Issues

**Error: `VITE_API_URL is not defined`**
```bash
# Create .env file in frontend directory
echo "VITE_API_URL=http://localhost:8000/api/v1" > .env
```

**Error: `Failed to fetch`**
- Ensure backend is running
- Check CORS_ORIGINS in backend `.env`
- Verify VITE_API_URL in frontend `.env`

### Database Issues

**Tables not created:**
- Re-run the migration SQL in Supabase SQL Editor
- Check for SQL errors in the output
- Verify you have the correct permissions

---

## 📚 Next Steps

1. **Seed Sample Data:**
   - Add sample products via the farmer dashboard
   - Create test orders

2. **Customize:**
   - Update branding in frontend
   - Adjust commission rate in backend `.env`
   - Add your logo and images

3. **Deploy:**
   - Frontend: Vercel, Netlify
   - Backend: Railway, Render, Heroku
   - Database: Already on Supabase ✅

4. **Add Features:**
   - Payment integration (Stripe)
   - Email notifications
   - SMS alerts
   - Real-time updates

---

## 🆘 Getting Help

- **Backend Docs:** http://localhost:8000/docs
- **Check Logs:** Look at terminal output for errors
- **Supabase Logs:** Supabase Dashboard → Logs
- **API Testing:** Use Postman or curl to test endpoints

---

## 🎉 Success!

If you've completed all steps, you now have a fully functional AgriConnect platform running locally!

**Default Ports:**
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

**Happy Coding! 🚀**
