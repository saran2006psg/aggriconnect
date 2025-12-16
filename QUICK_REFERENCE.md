# 📋 AgriConnect - Quick Reference

## 🚀 Quick Start Commands

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend | 5173 | http://localhost:5173 |
| Backend API | 8000 | http://localhost:8000 |
| API Docs | 8000 | http://localhost:8000/docs |

---

## 📡 API Endpoints Cheat Sheet

### Authentication
```
POST   /api/v1/auth/register       Register new user
POST   /api/v1/auth/login          Login
POST   /api/v1/auth/logout         Logout
```

### Users
```
GET    /api/v1/users/me            Get current user
PUT    /api/v1/users/me            Update profile
GET    /api/v1/users/farmer-profile   Get farmer profile
```

### Products
```
GET    /api/v1/products            List products
GET    /api/v1/products/{id}       Get product
POST   /api/v1/products            Create product
PUT    /api/v1/products/{id}       Update product
DELETE /api/v1/products/{id}       Delete product
```

### Cart
```
GET    /api/v1/cart                Get cart
POST   /api/v1/cart/items          Add to cart
PUT    /api/v1/cart/items/{id}     Update item
DELETE /api/v1/cart/items/{id}     Remove item
DELETE /api/v1/cart                Clear cart
```

### Orders
```
GET    /api/v1/orders              List orders
GET    /api/v1/orders/{id}         Get order
POST   /api/v1/orders              Create order
PUT    /api/v1/orders/{id}/status  Update status
```

### Wallet (Farmers)
```
GET    /api/v1/wallet              Get wallet
GET    /api/v1/wallet/transactions Get transactions
POST   /api/v1/wallet/withdraw     Request withdrawal
GET    /api/v1/wallet/earnings     Get earnings
```

### Analytics (Admin)
```
GET    /api/v1/analytics/dashboard Dashboard metrics
GET    /api/v1/analytics/users     User stats
GET    /api/v1/analytics/sales     Sales data
```

---

## 🔐 Authentication Headers

```bash
Authorization: Bearer <access_token>
```

---

## 📊 Database Tables

```
users               → User accounts
farmer_profiles     → Farmer data
products            → Product catalog
reviews             → Product reviews
carts               → Shopping carts
cart_items          → Cart items
orders              → Orders
order_items         → Order line items
subscriptions       → Recurring orders
wallets             → Farmer wallets
wallet_transactions → Wallet history
admin_analytics     → Platform stats
```

---

## 🌱 Sample Data

### Create Consumer
```json
{
  "email": "consumer@test.com",
  "password": "consumer123",
  "name": "John Doe",
  "role": "consumer"
}
```

### Create Farmer
```json
{
  "email": "farmer@test.com",
  "password": "farmer123",
  "name": "Jane Farm",
  "role": "farmer"
}
```

### Create Product
```json
{
  "name": "Organic Apples",
  "description": "Fresh organic apples",
  "category": "Fruits",
  "price": 4.99,
  "unit": "lb",
  "location": "California",
  "stock_quantity": 100
}
```

### Add to Cart
```json
{
  "product_id": "product-uuid-here",
  "quantity": 5
}
```

### Create Order
```json
{
  "shipping_address": "123 Main St, City, State 12345"
}
```

---

## 🔧 Environment Variables

### Backend (.env)
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
PLATFORM_COMMISSION_RATE=12.5
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GEMINI_API_KEY=your_gemini_key
```

---

## 🐛 Common Issues

### Backend won't start
```bash
# Check if virtual env is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists
ls -la .env
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:8000/health

# Check CORS settings in backend .env
CORS_ORIGINS=http://localhost:5173

# Check frontend .env
echo $VITE_API_URL
```

### Database connection error
```bash
# Verify Supabase credentials in backend .env
# Check internet connection
# Confirm Supabase project is active
```

---

## 📦 Project Structure

```
aggriconnect/
├── backend/
│   ├── app/
│   │   ├── api/routes/      → API endpoints
│   │   ├── models/          → Data models
│   │   ├── database/        → DB connection
│   │   ├── config.py        → Settings
│   │   └── main.py          → FastAPI app
│   ├── requirements.txt
│   ├── .env
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── pages/           → React pages
│   │   ├── components/      → Reusable components
│   │   ├── types/           → TypeScript types
│   │   └── App.tsx          → Main component
│   ├── package.json
│   └── .env
│
├── README.md
├── SETUP_GUIDE.md
└── API_INTEGRATION.md
```

---

## 🧪 Testing

### Test Backend
```bash
cd backend
curl http://localhost:8000/health
curl http://localhost:8000/docs
```

### Test Frontend
```bash
cd frontend
npm run dev
# Open http://localhost:5173
```

### Test API Call
```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test","role":"consumer"}'
```

---

## 🚀 Deployment

### Backend → Railway/Render
1. Connect GitHub repo
2. Set environment variables
3. Deploy

### Frontend → Vercel/Netlify
1. Connect GitHub repo
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy

---

## 📚 Useful Links

- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Supabase Dashboard:** https://app.supabase.com
- **Gemini API:** https://makersuite.google.com

---

## 🎯 User Roles

| Role | Access |
|------|--------|
| **Consumer** | Browse products, cart, orders, subscriptions |
| **Farmer** | Manage products, orders, wallet, analytics |
| **Admin** | Full platform access, analytics, user management |

---

## 💰 Commission System

- Platform takes **12.5%** commission
- Farmer receives **87.5%** of order total
- Commission calculated when order is delivered
- Payment credited to farmer's wallet automatically

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review API docs at /docs
3. Check Supabase logs
4. Review terminal output for errors

---

**Happy Building! 🌾**
