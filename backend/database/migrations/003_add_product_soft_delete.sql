-- Add soft-delete support for products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_products_deleted_at ON products(deleted_at);
