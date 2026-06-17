-- Volahi Database Schema Migration Script
-- Execute these SQL queries in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/_/sql)

-- Add delivery fee columns to products table if they don't already exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_fee_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_fee_amount NUMERIC DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS delivery_fee_notes TEXT DEFAULT '';
