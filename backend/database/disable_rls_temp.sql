-- Temporary fix to disable RLS for debugging
-- Run this in Supabase SQL Editor if cart/orders still don't work

-- Disable RLS on cart tables
ALTER TABLE carts DISABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Note: This is for development/testing only
-- In production, you should fix the RLS policies instead
