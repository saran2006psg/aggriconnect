-- Migration: Enhanced Order Tracking
-- Run this in Supabase SQL Editor

-- Add estimated delivery and delivered_at columns to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- ============================================
-- ORDER STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    changed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    changed_by_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_order_status_history_order ON order_status_history(order_id);
CREATE INDEX idx_order_status_history_created ON order_status_history(created_at DESC);

COMMENT ON TABLE order_status_history IS 'Tracks the history of status changes for each order';
COMMENT ON COLUMN orders.estimated_delivery IS 'Estimated delivery time based on current status';
COMMENT ON COLUMN orders.delivered_at IS 'Actual delivery timestamp';
