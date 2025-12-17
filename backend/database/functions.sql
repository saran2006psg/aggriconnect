-- Additional SQL Functions for AgriConnect
-- Run these after the main schema.sql

-- ============================================
-- FUNCTION: Decrement Product Stock
-- ============================================
CREATE OR REPLACE FUNCTION decrement_stock(product_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity - amount
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Increment Product Stock (for cancellations)
-- ============================================
CREATE OR REPLACE FUNCTION increment_stock(product_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE products
    SET stock_quantity = stock_quantity + amount
    WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get Order Statistics
-- ============================================
CREATE OR REPLACE FUNCTION get_order_stats(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    total_orders BIGINT,
    total_revenue NUMERIC,
    average_order_value NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_orders,
        SUM(total)::NUMERIC as total_revenue,
        AVG(total)::NUMERIC as average_order_value
    FROM orders
    WHERE created_at BETWEEN start_date AND end_date
        AND status != 'Cancelled';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Get Top Products
-- ============================================
CREATE OR REPLACE FUNCTION get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR,
    total_sold BIGINT,
    total_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        SUM(oi.quantity)::BIGINT as total_sold,
        SUM(oi.subtotal)::NUMERIC as total_revenue
    FROM products p
    JOIN order_items oi ON p.id = oi.product_id
    JOIN orders o ON oi.order_id = o.id
    WHERE o.status != 'Cancelled'
    GROUP BY p.id, p.name
    ORDER BY total_revenue DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: Check Low Stock Products
-- ============================================
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold INTEGER DEFAULT 10)
RETURNS TABLE (
    product_id UUID,
    product_name VARCHAR,
    current_stock INTEGER,
    farmer_id UUID,
    farmer_name VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p.id as product_id,
        p.name as product_name,
        p.stock_quantity as current_stock,
        u.id as farmer_id,
        COALESCE(u.farm_name, u.full_name) as farmer_name
    FROM products p
    JOIN users u ON p.farmer_id = u.id
    WHERE p.stock_quantity <= threshold
        AND p.is_available = true
    ORDER BY p.stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Sample Admin User (password: admin123)
INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'admin@aggriconnect.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oe2LGBYvYigm',
    'Admin User',
    'admin',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Note: Create sample farmers and consumers via the API endpoints
-- to ensure proper password hashing
