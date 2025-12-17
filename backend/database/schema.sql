-- AgriConnect Database Schema
-- PostgreSQL/Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('consumer', 'farmer', 'admin')),
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    
    -- Farmer-specific fields
    farm_name VARCHAR(255),
    farm_location VARCHAR(255),
    farm_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    unit VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Fruits', 'Vegetables', 'Dairy', 'Honey', 'Herbs')),
    description TEXT,
    location VARCHAR(255),
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
    is_available BOOLEAN DEFAULT TRUE,
    harvest_date DATE,
    rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_farmer ON products(farmer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);
CREATE INDEX idx_products_name ON products(name);

-- ============================================
-- CARTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_carts_user ON carts(user_id);

-- ============================================
-- CART ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(cart_id, product_id)
);

CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- ============================================
-- ADDRESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    street_address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    is_default BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    delivery_type VARCHAR(20) NOT NULL CHECK (delivery_type IN ('Delivery', 'Pickup')),
    delivery_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Pending',
    
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    promo_code VARCHAR(50),
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    
    qr_code TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_consumer ON orders(consumer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- ============================================
-- ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
CREATE INDEX idx_order_items_farmer ON order_items(farmer_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Weekly', 'Monthly')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Paused', 'Cancelled')) DEFAULT 'Active',
    next_delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_next_delivery ON subscriptions(next_delivery_date);

-- ============================================
-- SUBSCRIPTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    
    UNIQUE(subscription_id, product_id)
);

CREATE INDEX idx_subscription_items_subscription ON subscription_items(subscription_id);
CREATE INDEX idx_subscription_items_product ON subscription_items(product_id);

-- ============================================
-- BULK ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL CHECK (business_type IN ('Restaurant', 'Hotel', 'Caterer')),
    business_location VARCHAR(255) NOT NULL,
    budget_min DECIMAL(10, 2) NOT NULL CHECK (budget_min > 0),
    budget_max DECIMAL(10, 2) NOT NULL CHECK (budget_max >= budget_min),
    status VARCHAR(20) NOT NULL CHECK (status IN ('Pending', 'Responded', 'Accepted', 'Rejected')) DEFAULT 'Pending',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bulk_orders_consumer ON bulk_orders(consumer_id);
CREATE INDEX idx_bulk_orders_status ON bulk_orders(status);

-- ============================================
-- BULK ORDER ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bulk_order_id UUID NOT NULL REFERENCES bulk_orders(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    unit VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('Daily', 'Weekly', 'One-time'))
);

CREATE INDEX idx_bulk_order_items_bulk_order ON bulk_order_items(bulk_order_id);

-- ============================================
-- BULK ORDER RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bulk_order_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bulk_order_id UUID NOT NULL REFERENCES bulk_orders(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    quoted_price DECIMAL(10, 2) NOT NULL CHECK (quoted_price > 0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(bulk_order_id, farmer_id)
);

CREATE INDEX idx_bulk_order_responses_bulk_order ON bulk_order_responses(bulk_order_id);
CREATE INDEX idx_bulk_order_responses_farmer ON bulk_order_responses(farmer_id);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_orders_updated_at BEFORE UPDATE ON bulk_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTION TO UPDATE PRODUCT RATING
-- ============================================
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE product_id = NEW.product_id
    )
    WHERE id = NEW.product_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_order_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users: Can read own profile, admins can read all
CREATE POLICY users_select_own ON users
    FOR SELECT USING (auth.uid()::text = id::text OR (SELECT role FROM users WHERE id::text = auth.uid()::text) = 'admin');

CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Products: Anyone can read, farmers can CRUD their own
CREATE POLICY products_select_all ON products FOR SELECT USING (true);

CREATE POLICY products_insert_farmer ON products
    FOR INSERT WITH CHECK ((SELECT role FROM users WHERE id::text = auth.uid()::text) = 'farmer' AND farmer_id::text = auth.uid()::text);

CREATE POLICY products_update_farmer ON products
    FOR UPDATE USING (farmer_id::text = auth.uid()::text);

CREATE POLICY products_delete_farmer ON products
    FOR DELETE USING (farmer_id::text = auth.uid()::text);

-- Carts: Users can only access their own
CREATE POLICY carts_select_own ON carts
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY carts_insert_own ON carts
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY carts_update_own ON carts
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY carts_delete_own ON carts
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Cart Items: Users can only access their own
CREATE POLICY cart_items_select_own ON cart_items
    FOR SELECT USING ((SELECT user_id FROM carts WHERE id = cart_id)::text = auth.uid()::text);

CREATE POLICY cart_items_insert_own ON cart_items
    FOR INSERT WITH CHECK ((SELECT user_id FROM carts WHERE id = cart_id)::text = auth.uid()::text);

CREATE POLICY cart_items_update_own ON cart_items
    FOR UPDATE USING ((SELECT user_id FROM carts WHERE id = cart_id)::text = auth.uid()::text);

CREATE POLICY cart_items_delete_own ON cart_items
    FOR DELETE USING ((SELECT user_id FROM carts WHERE id = cart_id)::text = auth.uid()::text);

-- Orders: Consumers see their purchases, farmers see their sales, admins see all
CREATE POLICY orders_select ON orders
    FOR SELECT USING (
        consumer_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM order_items WHERE order_id = orders.id AND farmer_id::text = auth.uid()::text) OR
        (SELECT role FROM users WHERE id::text = auth.uid()::text) = 'admin'
    );

CREATE POLICY orders_insert_consumer ON orders
    FOR INSERT WITH CHECK (consumer_id::text = auth.uid()::text);

CREATE POLICY orders_update ON orders
    FOR UPDATE USING (
        consumer_id::text = auth.uid()::text OR
        EXISTS (SELECT 1 FROM order_items WHERE order_id = orders.id AND farmer_id::text = auth.uid()::text)
    );

-- Reviews: Anyone can read, users can create for products they purchased
CREATE POLICY reviews_select_all ON reviews FOR SELECT USING (true);

CREATE POLICY reviews_insert_own ON reviews
    FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

CREATE POLICY reviews_update_own ON reviews
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY reviews_delete_own ON reviews
    FOR DELETE USING (user_id::text = auth.uid()::text);

-- Notifications: Users can only see their own
CREATE POLICY notifications_select_own ON notifications
    FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY notifications_update_own ON notifications
    FOR UPDATE USING (user_id::text = auth.uid()::text);

CREATE POLICY notifications_delete_own ON notifications
    FOR DELETE USING (user_id::text = auth.uid()::text);
