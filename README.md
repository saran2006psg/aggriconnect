# 🌾 AgriConnect

AgriConnect is a full-stack agricultural marketplace platform that connects farmers and consumers directly. By eliminating intermediaries, the platform enables farmers to receive better returns on their produce while providing consumers with access to fresh goods at fair prices.

---

## ⚙️ System Architecture

AgriConnect uses a decoupled client-server architecture built entirely with TypeScript:

```mermaid
graph TD
    subgraph Client ["Client (Frontend)"]
        A[React 19 SPA] --> B[Vite 6 Bundler]
        A --> C[Axios API Client]
        A --> D[Tailwind CSS]
        A --> E[Recharts Dashboard]
    end

    subgraph Server ["Server (Backend)"]
        F[Express.js REST API] --> G[TypeScript]
        F --> H[JWT Auth & Google OAuth]
        F --> I[Order Auto-completion Scheduler]
        F --> J[Multer + Sharp Image Processor]
    end

    subgraph Database ["Database & Storage"]
        K[(Supabase PostgreSQL)]
        L[Supabase Auth Services]
        M[Supabase File Storage]
    end

    C -->|REST Requests + JWT Auth| F
    F -->|Database Operations| K
    F -->|Auth Verification| L
    F -->|Image Uploads| M
```

- **Frontend Client**: A single-page React application that communicates with the API via a centralized Axios client. It uses Tailwind CSS for styling and Recharts for interactive farmer and admin dashboards.
- **Backend API**: An Express.js server written in TypeScript that manages REST endpoints, handles user authentication, and runs scheduled tasks (like order status updates) using a cron scheduler.
- **Database & Storage**: Powered by Supabase, providing PostgreSQL database hosting, authentication, and file storage for product images and profile avatars.

---

## 📊 Database Schema

The relational database structure in Supabase PostgreSQL manages users, products, carts, orders, subscriptions, wallets, and notifications:

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email
        string password_hash
        string role "consumer | farmer | admin"
        string name
        string phone
        string avatar_url
        timestamp created_at
    }
    ADDRESSES {
        uuid id PK
        uuid user_id FK
        string type "billing | shipping"
        string line1
        string line2
        string city
        string state
        string postal_code
        boolean is_default
        timestamp created_at
    }
    PRODUCTS {
        uuid id PK
        string name
        string description
        decimal price
        string unit
        string category
        string image_url
        integer stock
        string status "active | inactive"
        uuid farmer_id FK
        timestamp created_at
    }
    CARTS {
        uuid id PK
        uuid user_id FK
        timestamp created_at
    }
    CART_ITEMS {
        uuid id PK
        uuid cart_id FK
        uuid product_id FK
        integer quantity
        timestamp created_at
    }
    ORDERS {
        uuid id PK
        string order_number
        uuid consumer_id FK
        uuid farmer_id FK
        decimal total_amount
        decimal commission_amount
        decimal payout_amount
        string status "pending | processing | shipped | delivered | completed | cancelled"
        timestamp created_at
        timestamp updated_at
    }
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
    }
    ORDER_STATUS_HISTORY {
        uuid id PK
        uuid order_id FK
        string status
        string notes
        uuid created_by FK
        timestamp created_at
    }
    SUBSCRIPTIONS {
        uuid id PK
        uuid consumer_id FK
        uuid farmer_id FK
        string frequency "weekly | biweekly | monthly"
        timestamp next_delivery_date
        string status "active | paused | cancelled"
        timestamp created_at
    }
    SUBSCRIPTION_ITEMS {
        uuid id PK
        uuid subscription_id FK
        uuid product_id FK
        integer quantity
    }
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        string message
        boolean is_read
        string type
        timestamp created_at
    }
    WALLETS {
        uuid id PK
        uuid user_id FK
        decimal balance
        decimal pending_balance
        timestamp updated_at
    }
    WALLET_TRANSACTIONS {
        uuid id PK
        uuid wallet_id FK
        string type "credit | debit"
        decimal amount
        string status "completed | pending | failed"
        uuid reference_id
        string description
        timestamp created_at
    }
    PAYOUT_REQUESTS {
        uuid id PK
        uuid wallet_id FK
        decimal amount
        string status "pending | approved | rejected"
        string bank_details
        timestamp created_at
    }

    USERS ||--o{ ADDRESSES : "has"
    USERS ||--o| WALLETS : "owns"
    USERS ||--o{ PRODUCTS : "lists"
    USERS ||--o{ CARTS : "has"
    USERS ||--o{ ORDERS : "places/receives"
    USERS ||--o{ SUBSCRIPTIONS : "subscribes"
    USERS ||--o{ NOTIFICATIONS : "receives"
    
    WALLETS ||--o{ WALLET_TRANSACTIONS : "logs"
    WALLETS ||--o{ PAYOUT_REQUESTS : "requests"
    
    CARTS ||--o{ CART_ITEMS : "contains"
    PRODUCTS ||--o{ CART_ITEMS : "in"
    
    ORDERS ||--o{ ORDER_ITEMS : "contains"
    PRODUCTS ||--o{ ORDER_ITEMS : "ordered"
    ORDERS ||--o{ ORDER_STATUS_HISTORY : "tracks"
    
    SUBSCRIPTIONS ||--o{ SUBSCRIPTION_ITEMS : "contains"
    PRODUCTS ||--o{ SUBSCRIPTION_ITEMS : "subscribed"
```

---

## 🎯 Core Features

### 🛒 Marketplace & Cart
- Direct access to local farmer product catalogs.
- Streamlined shopping cart checkouts linking consumers with matching farmers.

### 📅 Subscriptions
- Recurring scheduled orders (weekly, bi-weekly, monthly) to automate fresh food deliveries.

### 💼 Farmer Earnings & Wallet
- Secure balance ledgers for farmers showing credits, debits, pending balances, and transaction history.
- Built-in payout withdrawal request workflows.

### 🔔 In-App Notifications
- Direct, real-time-like notifications regarding order tracking updates, delivery status changes, and platform announcements.

### 📊 Admin Analytics
- High-level dashboards for administrators to track order counts, registered users, and system performance.
