# AgriConnect Backend API

FastAPI backend for AgriConnect - A platform connecting farmers directly with consumers.

## Features

- ✅ **Authentication**: Email/Password + Google OAuth
- ✅ **Role-Based Access Control**: Consumer, Farmer, Admin roles
- ✅ **Product Management**: CRUD operations with search & filtering
- ✅ **Shopping Cart**: Add, update, remove items
- ✅ **Order Processing**: Create orders, track status, order history
- ✅ **Subscriptions**: Recurring product deliveries
- ✅ **Bulk Orders**: Business-to-farmer bulk ordering system
- ✅ **Reviews & Ratings**: Product reviews and farmer ratings
- ✅ **Image Uploads**: Product and profile image management
- ✅ **Notifications**: Real-time user notifications
- ✅ **Admin Dashboard**: Platform statistics and management

## Tech Stack

- **Framework**: FastAPI 0.109.0
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + Google OAuth 2.0
- **Storage**: Supabase Storage
- **Image Processing**: Pillow

## Prerequisites

- Python 3.9 or higher
- Supabase account and project
- Google OAuth credentials (optional, for OAuth login)

## Installation

### 1. Clone the repository

```bash
cd backend
```

### 2. Create virtual environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_role_key
SECRET_KEY=your_secure_random_secret_key
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 5. Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL schema from `database/schema.sql`
4. Create two storage buckets:
   - `products` (public)
   - `profiles` (public)

### 6. Generate Secret Key

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Use the output as your `SECRET_KEY` in `.env`

## Running the Server

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/api/v1/docs
- ReDoc: http://localhost:8000/api/v1/redoc

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/google` - Login with Google OAuth
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/refresh` - Refresh access token

### Products

- `GET /api/v1/products` - Get all products (with filters)
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products` - Create product (Farmer)
- `PUT /api/v1/products/{id}` - Update product (Farmer)
- `DELETE /api/v1/products/{id}` - Delete product (Farmer)

### Cart

- `GET /api/v1/cart` - Get user's cart
- `POST /api/v1/cart/items` - Add item to cart
- `PUT /api/v1/cart/items/{id}` - Update cart item
- `DELETE /api/v1/cart/items/{id}` - Remove item from cart
- `DELETE /api/v1/cart/clear` - Clear entire cart

### Orders

- `POST /api/v1/orders` - Create order from cart
- `GET /api/v1/orders` - Get user's orders
- `GET /api/v1/orders/{id}` - Get order details
- `PATCH /api/v1/orders/{id}/status` - Update order status
- `POST /api/v1/orders/{id}/cancel` - Cancel order

### Subscriptions

- `GET /api/v1/subscriptions` - Get user subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `PATCH /api/v1/subscriptions/{id}/pause` - Pause subscription
- `PATCH /api/v1/subscriptions/{id}/resume` - Resume subscription
- `DELETE /api/v1/subscriptions/{id}` - Cancel subscription

### Bulk Orders

- `GET /api/v1/bulk-orders` - Get bulk orders
- `POST /api/v1/bulk-orders` - Create bulk order request
- `GET /api/v1/bulk-orders/{id}` - Get bulk order details
- `POST /api/v1/bulk-orders/{id}/respond` - Farmer responds to bulk order

### Users

- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/users/addresses` - Get user addresses
- `POST /api/v1/users/addresses` - Add new address
- `PUT /api/v1/users/addresses/{id}` - Update address
- `DELETE /api/v1/users/addresses/{id}` - Delete address

### Reviews

- `POST /api/v1/reviews` - Create product review
- `GET /api/v1/reviews/product/{id}` - Get product reviews

### Notifications

- `GET /api/v1/notifications` - Get notifications
- `PATCH /api/v1/notifications/{id}/read` - Mark as read
- `DELETE /api/v1/notifications/{id}` - Delete notification

### Upload

- `POST /api/v1/upload/product-image` - Upload product image
- `POST /api/v1/upload/profile-image` - Upload profile image

### Admin

- `GET /api/v1/admin/stats` - Get platform statistics
- `GET /api/v1/admin/farmers` - Get all farmers
- `GET /api/v1/admin/consumers` - Get all consumers
- `GET /api/v1/admin/orders` - Get all orders

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Access tokens expire after 30 minutes. Use the refresh token to get a new access token.

## API Response Format

All endpoints return a standardized response:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": null
}
```

Paginated responses:

```json
{
  "success": true,
  "message": "Items retrieved",
  "data": {
    "items": [...],
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  },
  "errors": null
}
```

## Error Handling

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Database Schema

See `database/schema.sql` for the complete database schema including:

- 14 tables with proper relationships
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates
- Indexes for performance
- Functions for rating calculations

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:5173` (frontend dev)
   - Your production domain
6. Copy Client ID and Client Secret to `.env`

## Connecting Frontend

Update your frontend's API base URL to:

```javascript
// frontend/src/services/apiClient.ts
const API_BASE_URL = "http://localhost:8000/api/v1";
```

Make sure the frontend origin is in the CORS_ORIGINS list in `app/core/config.py`.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── products.py
│   │       │   ├── cart.py
│   │       │   ├── orders.py
│   │       │   ├── subscriptions.py
│   │       │   ├── bulk_orders.py
│   │       │   ├── users.py
│   │       │   ├── reviews.py
│   │       │   ├── notifications.py
│   │       │   ├── admin.py
│   │       │   └── upload.py
│   │       └── api.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── supabase.py
│   ├── middleware/
│   │   └── auth.py
│   └── schemas/
│       ├── user.py
│       ├── product.py
│       ├── order.py
│       ├── other.py
│       └── common.py
├── database/
│   └── schema.sql
├── main.py
├── requirements.txt
├── .env.example
└── README.md
```

## Development Tips

1. **Testing APIs**: Use the interactive docs at `/api/v1/docs`
2. **Debugging**: Set `DEBUG=True` in config for detailed error messages
3. **Database Changes**: Run migrations through Supabase SQL Editor
4. **Image Upload**: Ensure Supabase storage buckets are public

## Known Limitations

- ❌ No wallet/payment system (as per requirements)
- ⚠️ Email verification not yet implemented
- ⚠️ Password reset tokens not yet implemented
- ⚠️ Real-time notifications require Supabase Realtime setup
- ⚠️ Stock decrement uses RPC function (needs to be created in Supabase)

## TODO

- [ ] Implement email verification
- [ ] Add password reset with secure tokens
- [ ] Set up scheduled jobs for subscription orders
- [ ] Add QR code generation for orders
- [ ] Implement real-time notifications
- [ ] Add rate limiting
- [ ] Add comprehensive logging
- [ ] Write unit tests
- [ ] Add API documentation

## Support

For issues or questions, please open an issue in the repository.

## License

MIT License
