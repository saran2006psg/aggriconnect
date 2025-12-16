# 🌾 AgriConnect Backend

Python FastAPI backend for the AgriConnect agricultural marketplace platform.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Supabase Account
- Virtual Environment (recommended)

### Installation

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Create virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your Supabase credentials:

   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   FRONTEND_CALLBACK_URL=http://localhost:5173/auth/callback
   ```
   
   > 📝 **Note**: JWT authentication has been replaced with Supabase Auth + OAuth 2.0.
   > See [README_OAUTH.md](README_OAUTH.md) for authentication setup and [OAUTH_SETUP_GUIDE.md](OAUTH_SETUP_GUIDE.md) for provider configuration.

5. **Set up database:**

   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL migration script from `app/database/migrations.sql`

6. **Run development server:**

   ```bash
   chmod +x run.sh
   ./run.sh
   ```

   Or manually:

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

7. **Access the API:**

   - API Server: http://localhost:8000
   - Interactive API Docs (Swagger): http://localhost:8000/docs
   - Alternative Docs (ReDoc): http://localhost:8000/redoc

## 🐳 Docker Setup

### Build and run with Docker Compose:

```bash
docker-compose up --build
```

### Build Docker image:

```bash
docker build -t aggriconnect-backend .
```

### Run Docker container:

```bash
docker run -p 8000:8000 --env-file .env aggriconnect-backend
```

## 📁 Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.py      # Authentication routes
│   │   │   ├── users.py     # User management
│   │   │   ├── products.py  # Product CRUD
│   │   │   ├── reviews.py   # Product reviews
│   │   │   ├── cart.py      # Shopping cart
│   │   │   ├── orders.py    # Order management
│   │   │   ├── subscriptions.py
│   │   │   ├── wallet.py    # Wallet & transactions
│   │   │   └── analytics.py # Admin analytics
│   │   └── utils/           # Utility functions
│   ├── database/
│   │   ├── db.py            # Supabase client
│   │   └── migrations.sql   # Database schema
│   ├── models/              # Pydantic models
│   ├── config.py            # Configuration
│   ├── dependencies.py      # FastAPI dependencies
│   └── main.py              # FastAPI application
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker image
├── docker-compose.yml      # Docker compose
├── .env.example            # Environment template
└── README.md               # This file
```

## 🔑 API Endpoints

### Authentication (`/api/v1/auth`)

- `POST /register` - Register new user
- `POST /login` - Login with credentials
- `POST /logout` - Logout

### Users (`/api/v1/users`)

- `GET /me` - Get current user profile
- `PUT /me` - Update current user profile
- `GET /farmer-profile` - Get farmer profile (farmers only)
- `PUT /farmer-profile` - Update farmer profile (farmers only)
- `GET /{user_id}` - Get user by ID (public)

### Products (`/api/v1/products`)

- `GET /` - List all products (with filters)
- `GET /{product_id}` - Get product details
- `POST /` - Create product (farmers only)
- `PUT /{product_id}` - Update product (farmers only)
- `DELETE /{product_id}` - Delete product (farmers only)
- `GET /farmer/my-products` - Get farmer's products

### Reviews (`/api/v1/reviews`)

- `GET /product/{product_id}` - Get product reviews
- `POST /` - Create review
- `DELETE /{review_id}` - Delete review

### Cart (`/api/v1/cart`)

- `GET /` - Get user's cart
- `POST /items` - Add item to cart
- `PUT /items/{item_id}` - Update cart item
- `DELETE /items/{item_id}` - Remove from cart
- `DELETE /` - Clear cart

### Orders (`/api/v1/orders`)

- `GET /` - List orders
- `GET /{order_id}` - Get order details
- `POST /` - Create order from cart
- `PUT /{order_id}/status` - Update order status

### Subscriptions (`/api/v1/subscriptions`)

- `GET /` - List subscriptions
- `GET /{subscription_id}` - Get subscription
- `POST /` - Create subscription
- `PUT /{subscription_id}` - Update subscription
- `PUT /{subscription_id}/pause` - Pause subscription
- `PUT /{subscription_id}/resume` - Resume subscription
- `DELETE /{subscription_id}` - Cancel subscription

### Wallet (`/api/v1/wallet`)

- `GET /` - Get wallet balance
- `GET /transactions` - Get transaction history
- `POST /withdraw` - Request withdrawal
- `GET /earnings` - Get earnings summary

### Analytics (`/api/v1/analytics`)

- `GET /dashboard` - Admin dashboard metrics
- `GET /users` - User statistics
- `GET /sales` - Sales analytics
- `GET /products` - Product analytics

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to receive access and refresh tokens
2. Include the access token in the Authorization header:
   ```
   Authorization: Bearer <your_access_token>
   ```
3. Access tokens expire in 15 minutes
4. Use refresh tokens to obtain new access tokens

## 🧪 Testing

Run tests with pytest:

```bash
pytest
```

Run with coverage:

```bash
pytest --cov=app tests/
```

## 🛠️ Tech Stack

- **FastAPI** - Modern web framework
- **Supabase** - PostgreSQL database & auth
- **Pydantic** - Data validation
- **Python-JOSE** - JWT handling
- **Passlib** - Password hashing
- **Uvicorn** - ASGI server

## 📊 Database Schema

The database includes the following tables:

- `users` - User accounts and profiles
- `farmer_profiles` - Farmer-specific data
- `products` - Product catalog
- `reviews` - Product reviews
- `carts` & `cart_items` - Shopping cart
- `orders` & `order_items` - Order management
- `subscriptions` - Recurring orders
- `wallets` & `wallet_transactions` - Farmer payments
- `admin_analytics` - Platform analytics

See `app/database/migrations.sql` for complete schema.

## 🌍 Environment Variables

Required environment variables:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT
JWT_SECRET=your_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=15
REFRESH_TOKEN_EXPIRATION_DAYS=7

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# API
API_V1_PREFIX=/api/v1
PROJECT_NAME=AgriConnect Backend
ENVIRONMENT=development

# Business
PLATFORM_COMMISSION_RATE=12.5
```

## 🚀 Deployment

### Deploy to Railway:

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Deploy to Render:

1. Create new Web Service
2. Connect repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Deploy to Heroku:

```bash
heroku create aggriconnect-backend
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_KEY=your_key
git push heroku main
```

## 📝 License

MIT License

## 👥 Contributors

AgriConnect Team

---

**Need help?** Check out the [API Documentation](http://localhost:8000/docs) or open an issue.
