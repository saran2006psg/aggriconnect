# AgriConnect - Quick Start Guide

Complete setup guide for running the AgriConnect platform (Frontend + Backend).

## 🚀 Quick Setup Steps

### 1. Prerequisites

- **Node.js** (v18 or higher)

- **Google OAuth Credentials** (optional, for OAuth login)- **Supabase Account** ([Sign up here](https://supabase.com))- **Python** (v3.9 or higher)

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard

3. Copy and run the entire SQL from `backend/database/schema.sql`
4. Go to **Storage** and create two public buckets:

   - `products` (for product images)

   - `service_role` key (secret!) - `anon` public key - Project URL5. Get your credentials from **Settings** > **API**: - `profiles` (for profile pictures)

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend
```

# Create virtual environment

python -m venv venv

# Activate virtual environment

# Windows:

venv\Scripts\activate

# macOS/Linux:

source venv/bin/activate

# Install dependencies

pip install -r requirements.txt

# Create .env file

SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...SUPABASE_URL=https://xxxxx.supabase.cocp .env.example .env

SECRET_KEY=your_generated_secret_key_hereSUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...````

```GOOGLE_CLIENT_SECRET=your_google_client_secretGOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.comEdit `backend/.env` with your credentials:

````env







































































































































































































































































**Happy Coding! 🌾**---4. Open an issue in the repository3. Check Supabase logs in dashboard2. Review API docs at http://localhost:8000/api/v1/docs1. Check the README files in `/backend` and `/frontend`## 🤝 Need Help?- [Vite Documentation](https://vitejs.dev/)- [React Documentation](https://react.dev/)- [Supabase Documentation](https://supabase.com/docs)- [FastAPI Documentation](https://fastapi.tiangolo.com/)## 📚 Additional Resources- Set up database backups- Enable RLS policies in production- Supabase handles hosting automatically### Database- Set `VITE_API_BASE_URL` to your backend URL- Deploy to: Vercel, Netlify, or Cloudflare Pages- Build: `npm run build`### Frontend- Use production HTTPS URLs- Update `CORS_ORIGINS` with your frontend URL- Set environment variables in platform dashboard- Deploy to: Railway, Render, Heroku, or AWS### Backend## 🚢 Production Deployment- ❌ Withdrawal/deposits- ❌ Balance management- ❌ Payment processing- ❌ Wallet system## 📦 Excluded Features (As Per Requirements)- ✅ Responsive design- ✅ Admin dashboard (statistics)- ✅ Consumer dashboard (order history)- ✅ Farmer dashboard (product management)- ✅ Order placement and tracking- ✅ Shopping cart management- ✅ Product browsing and search- ✅ Role-based routing- ✅ Authentication (Email/Password + Google OAuth)## 🎨 Frontend Features**Total: 47 API endpoints**| Admin | 4 endpoints | Admin only || Upload | 2 endpoints | Yes || Notifications | 3 endpoints | Yes || Reviews | 2 endpoints | Yes (create) || Users | 5 endpoints | Yes || Bulk Orders | 4 endpoints | Yes || Subscriptions | 5 endpoints | Yes || Orders | 5 endpoints | Yes || Cart | 5 endpoints | Yes || Products | 5 endpoints | Farmers for CRUD || Auth | 7 endpoints | No (except `/me`) ||----------|-----------|---------------|| Category | Endpoints | Auth Required |## 📊 API Endpoints Summary- **Service role key** should only be used server-side- **Rotate tokens** regularly- **Use HTTPS** in production- **Change SECRET_KEY** in production- **Never commit `.env` files** - they're in `.gitignore`## 🔒 Security Notes- For testing, you can temporarily disable RLS in Supabase- Policies are defined in schema**Error: "Row Level Security policy violation"**- Check you're using the correct Supabase project- Run the SQL schema from `backend/database/schema.sql`**Error: "Relation does not exist"**### Database Issues- Check authorized origins in Google Cloud Console- Verify `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`**Google OAuth not working**- Add `VITE_API_BASE_URL=http://localhost:8000/api/v1`- Create `frontend/.env` file**Error: "VITE_API_BASE_URL is not defined"**- Check CORS settings in `backend/app/core/config.py`- Ensure backend is running on port 8000**Error: "Failed to fetch"**### Frontend Issues- Clear localStorage in browser- Regenerate your `SECRET_KEY`**Error: "Invalid JWT"**- Verify your Supabase project is active- Check your `SUPABASE_URL` in `.env`**Error: "Connection refused to Supabase"**- Virtual environment is activated- Make sure you're in the `backend` directory**Error: "No module named 'app'"**### Backend Issues## 🐛 Troubleshooting```    └── .env    ├── requirements.txt    ├── main.py    │   └── schema.sql        # Database schema    ├── database/    │   └── schemas/           # Pydantic models    │   ├── middleware/        # Auth middleware    │   ├── core/              # Config, security, Supabase    │   ├── api/v1/endpoints/  # All API endpoints    ├── app/└── backend/               # FastAPI + Supabase││   └── .env│   ├── package.json│   │   └── types/│   │   ├── services/      # API client and service layer│   │   ├── pages/│   │   ├── components/│   ├── src/├── frontend/               # React + TypeScript + Viteaggriconnect/```## 📁 Project Structure- **Admin**: View statistics, manage all users and orders- **Farmer**: Manage products, view sales, respond to bulk orders- **Consumer**: Browse products, place orders, manage cart## 🎯 Default User Roles7. **Update order status** (as farmer)6. **Create order** from cart5. **Add product** to cart (as consumer)4. **Register** a consumer account3. **Create** a product (as farmer)2. **Login** to get tokens1. **Register** a farmer account### Test Flow6. Now you can test authenticated endpoints!5. Enter: `Bearer your_access_token_here`4. Click the **Authorize** button (🔒) at the top3. Copy the `accessToken` from the response```}  "farm_location": "California"  "farm_name": "Green Valley Farm",  "role": "farmer",  "full_name": "John Farmer",  "password": "password123",  "email": "farmer@test.com",{```json2. Use this sample data:1. Go to **POST /api/v1/auth/register**Using the API docs:### Creating Your First User5. Click "Execute"4. Fill in parameters3. Click "Try it out"2. Click on any endpoint1. Open http://localhost:8000/api/v1/docs### Using the Interactive Docs## 📝 Testing the API9. Add to both `backend/.env` and `frontend/.env`8. Copy **Client ID** and **Client Secret**   - Your production domain   - `http://localhost:5173`7. Add authorized redirect URIs:   - Your production domain   - `http://localhost:5173`6. Add authorized JavaScript origins:5. Application type: **Web application**4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**3. Enable **Google+ API**2. Create a new project1. Go to [Google Cloud Console](https://console.cloud.google.com/)## 🔑 Google OAuth Setup (Optional)Frontend will run at: http://localhost:5173```npm run dev# In frontend directory```bash#### Start Frontend Development Server- Health Check: http://localhost:8000/health- API Docs: http://localhost:8000/api/v1/docsBackend will run at: http://localhost:8000```python main.py# In backend directory with venv activated```bash#### Start Backend Server### 5. Running the Application```VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.comVITE_API_BASE_URL=http://localhost:8000/api/v1```envEdit `frontend/.env`:```cp .env.example .env# Create .env filenpm install# Install dependenciescd frontend# Navigate to frontend directory (from project root)```bash### 4. Frontend Setup```python -c "import secrets; print(secrets.token_urlsafe(32))"```bashGenerate a secure secret key:
````
