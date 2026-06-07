-- Migration: create_payment_providers.sql
-- Crea tabla para almacenar credenciales de pasarelas de pago
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS payment_providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR NOT NULL,                -- e.g., 'mercado_pago', 'flow', 'webpay'
  public_key VARCHAR,                       -- opcional (para algunos providers)
  access_token VARCHAR NOT NULL,            -- token de acceso / credencial principal
  webhook_secret VARCHAR,                   -- secreto usado para validar firmas webhook
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para búsquedas rápidas por provider
CREATE INDEX IF NOT EXISTS idx_payment_providers_provider ON payment_providers (provider);

-- Insertar credenciales de Mercado Pago (APP_USR tokens)
INSERT INTO payment_providers (provider, access_token)
VALUES
  ('mercado_pago', 'APP_USR-7aa22804-9bd9-4f49-9f41-b794494b7bc9'),
  ('mercado_pago', 'APP_USR-3228087156660386-030800-9615ec42be26fe19b73d1a019ee74d44-3252751772')
ON CONFLICT DO NOTHING;
