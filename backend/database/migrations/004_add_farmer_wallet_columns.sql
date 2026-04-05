-- Add wallet fields to track farmer earnings from delivered orders
ALTER TABLE users
ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(12, 2) DEFAULT 0;
