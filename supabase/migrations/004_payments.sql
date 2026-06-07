-- 004_payments.sql
-- Tabla para registrar pagos de proveedores y vincularlos a votos

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider text NOT NULL,          -- e.g., 'mercadopago', 'flow', 'webpay'
  provider_payment_id text NOT NULL, -- ID devuelto por el proveedor
  status text NOT NULL,            -- e.g., 'completed', 'pending', 'failed'
  amount integer NOT NULL,         -- cantidad de votos pagados
  vote_id uuid REFERENCES votes(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índice para búsqueda rápida por provider_payment_id
CREATE UNIQUE INDEX payments_provider_payment_id_idx ON payments(provider_payment_id);
