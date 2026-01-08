-- Optimize cart queries with composite indexes
-- This migration adds indexes to speed up cart operations

-- Add composite index for cart_items lookups (cart_id + product_id)
-- This speeds up the "check if item exists in cart" query
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_product ON cart_items(cart_id, product_id);

-- Add index for user cart lookup optimization
CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id) WHERE user_id IS NOT NULL;

-- Add partial index for available products (speeds up product listing)
CREATE INDEX IF NOT EXISTS idx_products_available_category ON products(category, is_available) WHERE is_available = TRUE;

-- Analyze tables to update statistics for query planner
ANALYZE carts;
ANALYZE cart_items;
ANALYZE products;
