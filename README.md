# 🌾 AgriConnect

Full-stack agricultural marketplace platform connecting farmers and consumers directly.

## 📦 Project Structure

This repository contains both frontend and backend:

- **`/frontend`** - React TypeScript application
- **`/backend`** - Python FastAPI REST API

---

## 🌾 AgriConnect Frontend

React TypeScript frontend for the AgriConnect agricultural marketplace platform.

## 🚀 Quick Start

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   Create or update `.env` file with your Gemini API key:

   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

   Get your API key from: https://makersuite.google.com/app/apikey

3. **Run development server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## 📜 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking

## 📁 Project Structure

```
frontend/
├── src/
│   ├── assets/            # Images, icons, fonts
│   ├── components/        # Reusable React components
│   ├── data/              # Static data (data.ts)
│   ├── pages/             # Page components (18 pages)
│   ├── styles/            # Global styles (index.css)
│   ├── types/             # TypeScript definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── index.tsx          # App entry point
├── .env                   # Environment variables
├── index.html             # HTML template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
└── vite.config.ts         # Vite config
```

## 🗂️ Path Aliases

Clean imports using TypeScript path aliases:

```typescript
@/*           → src/*
@components/* → src/components/*
@pages/*      → src/pages/*
@utils/*      → src/utils/*
@types/*      → src/types/*
@data/*       → src/data/*
@styles/*     → src/styles/*
@assets/*     → src/assets/*
```

Example:

```typescript
import { Product } from "@types/types";
import ConsumerHome from "@pages/ConsumerHome";
```

## 🛠️ Tech Stack

- **React 19** - UI Framework
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool
- **Recharts** - Data visualization
- **Tailwind CSS** - Styling
- **Google Gemini AI** - AI features

## 🏗️ Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## 🌐 Environment Variables

| Variable              | Description           | Required |
| --------------------- | --------------------- | -------- |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | Yes      |

---

## 🔧 AgriConnect Backend

Python FastAPI backend with Supabase PostgreSQL database.

### Quick Start (Backend)

1. **Navigate to backend:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials.

5. **Run database migrations:**

   - Go to Supabase SQL Editor
   - Run the SQL from `backend/app/database/migrations.sql`

6. **Start backend server:**

   ```bash
   uvicorn app.main:app --reload
   ```

   API will be available at `http://localhost:8000`
   API Docs at `http://localhost:8000/docs`

### Backend Tech Stack

- **FastAPI** - Modern Python web framework
- **Supabase** - PostgreSQL database & authentication
- **Pydantic** - Data validation
- **JWT** - Secure authentication
- **Python 3.11+**

### Key Features

✅ User authentication (JWT tokens)  
✅ Role-based access control (Consumer, Farmer, Admin)  
✅ Product catalog with search & filters  
✅ Shopping cart & order management  
✅ Farmer wallet & commission system  
✅ Subscription management  
✅ Product reviews & ratings  
✅ Admin analytics dashboard  

### API Documentation

- Interactive Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

See [backend/README.md](backend/README.md) for detailed documentation.

---

## 🚀 Full Stack Development

### Run Both Services:

**Terminal 1 (Frontend):**
```bash
cd frontend
npm install
npm run dev
```

**Terminal 2 (Backend):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Setup

**Frontend (.env):**
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_URL=http://localhost:8000/api/v1
```

**Backend (.env):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## 🐳 Docker Setup

Run the entire stack with Docker:

```bash
# Backend
cd backend
docker-compose up

# Frontend (in another terminal)
cd frontend
npm run dev
```

---

## 📊 Database Schema

The platform uses Supabase (PostgreSQL) with the following tables:

- **users** - User accounts & authentication
- **farmer_profiles** - Farmer-specific data
- **products** - Product catalog
- **reviews** - Product reviews & ratings
- **carts & cart_items** - Shopping cart
- **orders & order_items** - Order management
- **subscriptions** - Recurring orders
- **wallets & wallet_transactions** - Payment system
- **admin_analytics** - Platform analytics

See `backend/app/database/migrations.sql` for complete schema.

---

## 🎯 Features

### For Consumers
- Browse fresh produce from local farmers
- Add products to cart & checkout
- Subscribe to regular deliveries
- Track orders in real-time
- Review & rate products

### For Farmers
- List products with inventory management
- Manage orders & update status
- Track earnings & wallet balance
- Request withdrawals
- View sales analytics

### For Admins
- Platform-wide analytics dashboard
- User & farmer management
- Order oversight
- Revenue & commission tracking

---

## 🛣️ Roadmap

- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Real-time notifications (WebSocket)
- [ ] Email & SMS notifications
- [ ] Mobile app (React Native)
- [ ] AI-powered product recommendations
- [ ] Multi-language support
- [ ] Advanced search & filters

---

## 📝 License

MIT License

---

**Built with ❤️ for farmers and consumers**
