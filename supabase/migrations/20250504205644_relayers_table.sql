CREATE TABLE IF NOT EXISTS public.relayers (
  public_key TEXT PRIMARY KEY,
  pda_address TEXT NOT NULL, 
  associated_token TEXT NOT NULL,
  uuid TEXT NOT NULL
); 