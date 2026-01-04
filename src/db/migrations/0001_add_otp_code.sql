-- Migration to add code column to magic_tokens
ALTER TABLE magic_tokens ADD COLUMN IF NOT EXISTS code text;
