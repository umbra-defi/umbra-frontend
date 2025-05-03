-- Create users table for Umbra
CREATE TABLE public.umbra_users (
    user_wallet_address BYTEA PRIMARY KEY,      -- 32 bytes for wallet address as primary key
    password VARCHAR(60) NOT NULL,              -- 60 chars for password (suitable for bcrypt)
    encrypted_data BYTEA,                       -- Variable length encrypted data
    updated_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- Create hash index on wallet address for fast lookups (not needed since it's now the primary key)
-- PostgreSQL automatically creates an index on primary key columns

-- Enable RLS
ALTER TABLE public.umbra_users ENABLE ROW LEVEL SECURITY;

-- Function to get current user's wallet address from JWT claims
CREATE OR REPLACE FUNCTION current_user_wallet_address() 
RETURNS BYTEA AS $$
BEGIN
    RETURN decode(nullif(current_setting('request.jwt.claims', true)::json->>'wallet_address', ''), 'hex');
EXCEPTION
    WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments
COMMENT ON TABLE public.umbra_users IS 'Stores Umbra user data including wallet addresses and encrypted information';

-- Create policy for users to access only their own data
CREATE POLICY "Users can manage their own data" 
    ON public.umbra_users 
    FOR ALL 
    USING (user_wallet_address = current_user_wallet_address());