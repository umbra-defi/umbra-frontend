CREATE TABLE IF NOT EXISTS token_list (
  mint_address_on_mainnet VARCHAR(44) PRIMARY KEY,
  mint_address_on_devnet VARCHAR(44) NOT NULL,
  mint_ticker_symbol VARCHAR(44) NOT NULL
); 