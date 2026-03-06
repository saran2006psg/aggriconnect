-- Migration: Add product_id and estimated_total to bulk orders
-- Date: 2026-03-05

-- Add estimated_total to bulk_orders table
ALTER TABLE bulk_orders
ADD COLUMN IF NOT EXISTS estimated_total DECIMAL(10, 2) DEFAULT 0;

-- Add product_id to bulk_order_items table
ALTER TABLE bulk_order_items
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Create index on product_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bulk_order_items_product ON bulk_order_items(product_id);

-- Update existing records to set estimated_total to 0 if NULL
UPDATE bulk_orders SET estimated_total = 0 WHERE estimated_total IS NULL;
