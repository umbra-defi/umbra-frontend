-- Create users table for Umbra
CREATE TABLE public.umbra_users (
    user_wallet_address VARCHAR(44) NOT NULL,      -- Solana Pubkey
    password VARCHAR(60) NOT NULL,              -- 60 chars for password (suitable for bcrypt)
    encrypted_data BYTEA,                       -- Variable length encrypted data
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.umbra_users ENABLE ROW LEVEL SECURITY;
-- Add comments
COMMENT ON TABLE public.umbra_users IS 'Stores Umbra user data including wallet addresses and encrypted information';