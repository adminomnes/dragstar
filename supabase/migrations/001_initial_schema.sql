-- ============================================================
-- DRAG STAR ANTOFAGASTA — Esquema completo de base de datos
-- Migración: 001_initial_schema.sql
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. TABLA: profiles
-- Extiende auth.users de Supabase con datos adicionales
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT NOT NULL DEFAULT 'user'
                  CHECK (role IN ('admin', 'moderator', 'user')),
  is_banned     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios extendidos desde auth.users';
COMMENT ON COLUMN public.profiles.role IS 'admin = control total, moderator = sin borrar, user = solo votar';

-- ============================================================
-- 2. TABLA: configurations
-- Parámetros globales configurables del concurso
-- ============================================================
CREATE TABLE IF NOT EXISTS public.configurations (
  key           TEXT PRIMARY KEY,
  value         JSONB NOT NULL,
  description   TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE public.configurations IS 'Configuración global del sistema (valor del voto, votación activa, fechas, etc.)';

-- Datos iniciales de configuración
INSERT INTO public.configurations (key, value, description) VALUES
  ('vote_price_clp',    '100',              'Precio en CLP por 1 voto'),
  ('voting_open',       'true',             'Si la votación está abierta'),
  ('prize_percentage',  '100',              '% de recaudación que va al premio'),
  ('max_votes_per_tx',  '100',              'Máximo de votos por transacción'),
  ('event_name',        '"DRAG STAR ANTOFAGASTA"', 'Nombre del evento'),
  ('current_week',      '1',                'Semana actual del concurso'),
  ('grand_final_date',  '"2024-12-31"',     'Fecha de la gran final')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 3. TABLA: participants
-- Las drag queens que compiten
-- ============================================================
CREATE TABLE IF NOT EXISTS public.participants (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stage_name      TEXT NOT NULL UNIQUE,
  real_name       TEXT,
  city            TEXT NOT NULL DEFAULT 'Antofagasta',
  bio             TEXT,
  short_bio       TEXT,
  profile_image   TEXT,
  banner_image    TEXT,
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'eliminated', 'finalist', 'winner')),
  instagram_url   TEXT,
  tiktok_url      TEXT,
  facebook_url    TEXT,
  youtube_url     TEXT,
  elimination_week INT,
  display_order   INT DEFAULT 0,
  is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
  total_votes     BIGINT NOT NULL DEFAULT 0,  -- desnormalizado para performance
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.participants IS 'Participantes del concurso drag';
COMMENT ON COLUMN public.participants.total_votes IS 'Cache desnormalizado. Se actualiza por trigger.';

-- ============================================================
-- 4. TABLA: gala_events
-- Las 10 galas semanales del concurso
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gala_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number     INT NOT NULL UNIQUE CHECK (week_number BETWEEN 1 AND 10),
  title           TEXT NOT NULL,
  theme           TEXT,
  description     TEXT,
  event_date      DATE NOT NULL,
  event_time      TIME DEFAULT '21:00',
  venue           TEXT DEFAULT 'Antofagasta',
  status          TEXT NOT NULL DEFAULT 'upcoming'
                    CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  cover_image     TEXT,
  video_url       TEXT,
  voting_open     BOOLEAN NOT NULL DEFAULT FALSE,
  voting_opens_at TIMESTAMPTZ,
  voting_closes_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gala_events IS 'Galas semanales del concurso';

-- Insertar las 10 galas predefinidas
INSERT INTO public.gala_events (week_number, title, theme, event_date) VALUES
  (1,  'Presentación',           'Presentación', '2024-08-02'),
  (2,  'Glamour',                'Glamour', '2024-08-09'),
  (3,  'Divas Internacionales',  'Divas Internacionales', '2024-08-16'),
  (4,  'Divas Latinas',          'Divas Latinas', '2024-08-23'),
  (5,  'Talento',                'Talento', '2024-08-30'),
  (6,  'Temática',               'Temática', '2024-09-06'),
  (7,  'Diversidad',             'Diversidad', '2024-09-13'),
  (8,  'Alta Costura',           'Alta Costura', '2024-09-20'),
  (9,  'Semifinal',              'Semifinal', '2024-09-27'),
  (10, 'Gran Final',             'Gran Final', '2024-10-04')
ON CONFLICT (week_number) DO NOTHING;

-- ============================================================
-- 5. TABLA: gala_results
-- Resultados por participante en cada gala
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gala_results (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gala_id         UUID NOT NULL REFERENCES public.gala_events(id) ON DELETE CASCADE,
  participant_id  UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  result          TEXT NOT NULL DEFAULT 'participated'
                    CHECK (result IN ('winner', 'top3', 'safe', 'btm3', 'eliminated', 'immune', 'participated')),
  performance_score NUMERIC(5,2),
  judge_notes     TEXT,
  is_public_favorite BOOLEAN DEFAULT FALSE, -- "Favorita del Público"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(gala_id, participant_id)
);

COMMENT ON TABLE public.gala_results IS 'Resultados por participante en cada gala';

-- ============================================================
-- 6. TABLA: gala_media
-- Fotos y videos de cada gala
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gala_media (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gala_id         UUID NOT NULL REFERENCES public.gala_events(id) ON DELETE CASCADE,
  participant_id  UUID REFERENCES public.participants(id) ON DELETE SET NULL,
  media_type      TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  url             TEXT NOT NULL,
  thumbnail_url   TEXT,
  caption         TEXT,
  display_order   INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.gala_media IS 'Galería de fotos y videos por gala';

-- ============================================================
-- 7. TABLA: transactions
-- Pagos realizados para votar (Mercado Pago, Flow, Webpay)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  participant_id    UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
  gala_id           UUID REFERENCES public.gala_events(id) ON DELETE SET NULL,
  amount_clp        NUMERIC(12,2) NOT NULL CHECK (amount_clp > 0),
  vote_quantity     INT NOT NULL CHECK (vote_quantity > 0),
  payment_provider  TEXT NOT NULL CHECK (payment_provider IN ('mercadopago', 'flow', 'webpay', 'manual')),
  provider_tx_id    TEXT,                 -- ID externo de la pasarela
  provider_order_id TEXT,                 -- Orden/preferencia generada
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'disputed')),
  payer_email       TEXT,
  payer_name        TEXT,
  ip_address        INET,
  user_agent        TEXT,
  metadata          JSONB DEFAULT '{}',   -- respuesta raw de la pasarela
  webhook_received_at TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'Pagos procesados por pasarelas de pago';

-- ============================================================
-- 8. TABLA: votes
-- Votos individuales (se insertan tras confirmar pago)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.votes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE RESTRICT,
  participant_id  UUID NOT NULL REFERENCES public.participants(id) ON DELETE RESTRICT,
  gala_id         UUID REFERENCES public.gala_events(id) ON DELETE SET NULL,
  quantity        INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  week_number     INT CHECK (week_number BETWEEN 1 AND 10),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.votes IS 'Votos registrados tras confirmación de pago';

-- ============================================================
-- 9. TABLA: prize_pool
-- Premio acumulado en tiempo real
-- ============================================================
CREATE TABLE IF NOT EXISTS public.prize_pool (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  total_clp         NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_votes       BIGINT NOT NULL DEFAULT 0,
  last_updated      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insertar fila única del premio
INSERT INTO public.prize_pool (total_clp, total_votes) VALUES (0, 0)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. TABLA: news
-- Noticias y novedades del concurso
-- ============================================================
CREATE TABLE IF NOT EXISTS public.news (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  content         TEXT,
  excerpt         TEXT,
  cover_image     TEXT,
  author_id       UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_published    BOOLEAN NOT NULL DEFAULT FALSE,
  published_at    TIMESTAMPTZ,
  tags            TEXT[],
  view_count      INT DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.news IS 'Noticias y novedades del concurso';

-- ============================================================
-- 11. TABLA: sponsors
-- Auspiciadores y patrocinadores
-- ============================================================
CREATE TABLE IF NOT EXISTS public.sponsors (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  logo_url        TEXT,
  website_url     TEXT,
  tier            TEXT DEFAULT 'standard'
                    CHECK (tier IN ('platinum', 'gold', 'silver', 'standard')),
  display_order   INT DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.sponsors IS 'Patrocinadores del concurso';

-- ============================================================
-- 12. TABLA: audit_logs
-- Auditoría completa del sistema anti-fraude
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name      TEXT NOT NULL,
  record_id       UUID,
  action          TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'VOTE', 'PAYMENT')),
  old_values      JSONB,
  new_values      JSONB,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ip_address      INET,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.audit_logs IS 'Registro completo de auditoría y anti-fraude';

-- ============================================================
-- 13. VISTA: ranking_general
-- Ranking en tiempo real de participantes por votos
-- ============================================================
CREATE OR REPLACE VIEW public.ranking_general AS
SELECT
  p.id,
  p.stage_name,
  p.city,
  p.profile_image,
  p.status,
  p.total_votes,
  ROW_NUMBER() OVER (ORDER BY p.total_votes DESC, p.created_at ASC) AS position,
  -- Votos de la semana actual
  COALESCE(vw.votes_this_week, 0) AS votes_this_week
FROM public.participants p
LEFT JOIN (
  SELECT
    v.participant_id,
    SUM(v.quantity) AS votes_this_week
  FROM public.votes v
  JOIN public.gala_events g ON v.gala_id = g.id
  WHERE g.week_number = (
    SELECT (value::text)::int FROM public.configurations WHERE key = 'current_week'
  )
  GROUP BY v.participant_id
) vw ON vw.participant_id = p.id
WHERE p.status IN ('active', 'finalist')
ORDER BY p.total_votes DESC;

COMMENT ON VIEW public.ranking_general IS 'Vista de ranking en tiempo real. Usada en la página principal.';

-- ============================================================
-- 14. VISTA: weekly_favorites
-- Favorita del público por gala (más votada en esa semana)
-- ============================================================
CREATE OR REPLACE VIEW public.weekly_favorites AS
SELECT DISTINCT ON (v.gala_id)
  v.gala_id,
  g.week_number,
  g.title AS gala_title,
  v.participant_id,
  p.stage_name,
  p.profile_image,
  SUM(v.quantity) OVER (PARTITION BY v.gala_id, v.participant_id) AS votes_in_gala
FROM public.votes v
JOIN public.gala_events g ON v.gala_id = g.id
JOIN public.participants p ON v.participant_id = p.id
ORDER BY v.gala_id, votes_in_gala DESC;

COMMENT ON VIEW public.weekly_favorites IS '"Favorita del Público" por gala (inmunidad popular)';

-- ============================================================
-- 15. VISTA: admin_transactions_view
-- Vista enriquecida para el panel admin
-- ============================================================
CREATE OR REPLACE VIEW public.admin_transactions_view AS
SELECT
  t.id,
  t.created_at,
  t.amount_clp,
  t.vote_quantity,
  t.payment_provider,
  t.status,
  t.payer_email,
  t.payer_name,
  t.ip_address,
  t.provider_tx_id,
  p.stage_name AS participant_name,
  g.week_number AS gala_week,
  g.title AS gala_title
FROM public.transactions t
JOIN public.participants p ON t.participant_id = p.id
LEFT JOIN public.gala_events g ON t.gala_id = g.id
ORDER BY t.created_at DESC;

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_votes_participant_id    ON public.votes(participant_id);
CREATE INDEX IF NOT EXISTS idx_votes_gala_id           ON public.votes(gala_id);
CREATE INDEX IF NOT EXISTS idx_votes_transaction_id    ON public.votes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_votes_week_number       ON public.votes(week_number);
CREATE INDEX IF NOT EXISTS idx_votes_created_at        ON public.votes(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_status     ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_participant ON public.transactions(participant_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider   ON public.transactions(payment_provider);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ip         ON public.transactions(ip_address);

CREATE INDEX IF NOT EXISTS idx_participants_status     ON public.participants(status);
CREATE INDEX IF NOT EXISTS idx_participants_votes      ON public.participants(total_votes DESC);

CREATE INDEX IF NOT EXISTS idx_gala_events_week        ON public.gala_events(week_number);
CREATE INDEX IF NOT EXISTS idx_gala_events_status      ON public.gala_events(status);

CREATE INDEX IF NOT EXISTS idx_gala_media_gala         ON public.gala_media(gala_id);
CREATE INDEX IF NOT EXISTS idx_gala_results_gala       ON public.gala_results(gala_id);
CREATE INDEX IF NOT EXISTS idx_gala_results_participant ON public.gala_results(participant_id);

CREATE INDEX IF NOT EXISTS idx_audit_logs_table        ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action       ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip           ON public.audit_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_news_published          ON public.news(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_slug               ON public.news(slug);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_participants_updated_at
  BEFORE UPDATE ON public.participants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_gala_events_updated_at
  BEFORE UPDATE ON public.gala_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Trigger: cuando se confirma un pago (status → completed),
-- insertar votos y actualizar totales
CREATE OR REPLACE FUNCTION public.confirm_transaction_votes()
RETURNS TRIGGER AS $$
DECLARE
  cfg_percentage NUMERIC;
  prize_amount   NUMERIC;
  current_week_val INT;
BEGIN
  -- Solo actuar cuando cambia a 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN

    -- 1. Obtener la semana actual
    SELECT (value::text)::int INTO current_week_val
    FROM public.configurations WHERE key = 'current_week';

    -- 2. Insertar fila de votos
    INSERT INTO public.votes (
      transaction_id, participant_id, gala_id, quantity, week_number
    ) VALUES (
      NEW.id, NEW.participant_id, NEW.gala_id, NEW.vote_quantity, current_week_val
    );

    -- 3. Actualizar total_votes del participante
    UPDATE public.participants
    SET total_votes = total_votes + NEW.vote_quantity
    WHERE id = NEW.participant_id;

    -- 4. Actualizar premio acumulado
    SELECT (value::text)::numeric INTO cfg_percentage
    FROM public.configurations WHERE key = 'prize_percentage';

    prize_amount := NEW.amount_clp * (cfg_percentage / 100);

    UPDATE public.prize_pool
    SET total_clp    = total_clp + prize_amount,
        total_votes  = total_votes + NEW.vote_quantity,
        last_updated = NOW();

    -- 5. Registrar en auditoría
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values, ip_address)
    VALUES (
      'transactions',
      NEW.id,
      'VOTE',
      jsonb_build_object(
        'participant_id', NEW.participant_id,
        'vote_quantity', NEW.vote_quantity,
        'amount_clp', NEW.amount_clp,
        'provider', NEW.payment_provider
      ),
      NEW.ip_address
    );

    -- 6. Registrar timestamp de completado
    NEW.completed_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_confirm_votes
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.confirm_transaction_votes();

-- Trigger: crear perfil automáticamente cuando se registra un usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gala_events      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gala_results     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gala_media       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prize_pool       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configurations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs       ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS RLS
-- ================================================================

-- HELPER: función para verificar si el usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- HELPER: función para verificar si el usuario actual es admin o moderador
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── profiles ─────────────────────────────────────────────────
-- Cualquiera puede ver perfiles básicos
CREATE POLICY "profiles_select_public" ON public.profiles
  FOR SELECT USING (TRUE);

-- Solo el propio usuario puede actualizar su perfil
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins pueden actualizar cualquier perfil (cambiar rol, banear)
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ─── participants ──────────────────────────────────────────────
-- Todo el mundo puede ver participantes activas
CREATE POLICY "participants_select_public" ON public.participants
  FOR SELECT USING (TRUE);

-- Solo staff puede insertar o modificar
CREATE POLICY "participants_write_staff" ON public.participants
  FOR ALL USING (public.is_staff());

-- ─── gala_events ──────────────────────────────────────────────
CREATE POLICY "galas_select_public" ON public.gala_events
  FOR SELECT USING (TRUE);

CREATE POLICY "galas_write_staff" ON public.gala_events
  FOR ALL USING (public.is_staff());

-- ─── gala_results ─────────────────────────────────────────────
CREATE POLICY "gala_results_select_public" ON public.gala_results
  FOR SELECT USING (TRUE);

CREATE POLICY "gala_results_write_staff" ON public.gala_results
  FOR ALL USING (public.is_staff());

-- ─── gala_media ───────────────────────────────────────────────
CREATE POLICY "gala_media_select_public" ON public.gala_media
  FOR SELECT USING (TRUE);

CREATE POLICY "gala_media_write_staff" ON public.gala_media
  FOR ALL USING (public.is_staff());

-- ─── transactions ─────────────────────────────────────────────
-- Usuario solo ve sus propias transacciones
CREATE POLICY "transactions_select_own" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Staff ve todas
CREATE POLICY "transactions_select_staff" ON public.transactions
  FOR SELECT USING (public.is_staff());

-- Cualquiera puede insertar (pago anónimo permitido, validado por API)
CREATE POLICY "transactions_insert_any" ON public.transactions
  FOR INSERT WITH CHECK (TRUE);

-- Solo admin puede actualizar (para webhooks y correcciones)
-- La actualización se hace con SECURITY DEFINER en la función del trigger
CREATE POLICY "transactions_update_admin" ON public.transactions
  FOR UPDATE USING (public.is_admin());

-- ─── votes ────────────────────────────────────────────────────
-- Todo el mundo puede ver votos (totales son públicos)
CREATE POLICY "votes_select_public" ON public.votes
  FOR SELECT USING (TRUE);

-- Solo se insertan via trigger (SECURITY DEFINER), no directamente
CREATE POLICY "votes_insert_trigger" ON public.votes
  FOR INSERT WITH CHECK (public.is_admin());

-- ─── prize_pool ───────────────────────────────────────────────
CREATE POLICY "prize_pool_select_public" ON public.prize_pool
  FOR SELECT USING (TRUE);

CREATE POLICY "prize_pool_update_admin" ON public.prize_pool
  FOR UPDATE USING (public.is_admin());

-- ─── news ─────────────────────────────────────────────────────
-- Público solo ve noticias publicadas
CREATE POLICY "news_select_published" ON public.news
  FOR SELECT USING (is_published = TRUE OR public.is_staff());

CREATE POLICY "news_write_staff" ON public.news
  FOR ALL USING (public.is_staff());

-- ─── sponsors ─────────────────────────────────────────────────
CREATE POLICY "sponsors_select_public" ON public.sponsors
  FOR SELECT USING (is_active = TRUE OR public.is_staff());

CREATE POLICY "sponsors_write_admin" ON public.sponsors
  FOR ALL USING (public.is_admin());

-- ─── configurations ───────────────────────────────────────────
-- Público puede leer configuraciones no sensibles
CREATE POLICY "config_select_public" ON public.configurations
  FOR SELECT USING (
    key NOT IN ('webhook_secret_mp', 'webhook_secret_flow', 'webhook_secret_wp')
  );

CREATE POLICY "config_write_admin" ON public.configurations
  FOR ALL USING (public.is_admin());

-- ─── audit_logs ───────────────────────────────────────────────
-- Solo admins pueden ver los logs de auditoría
CREATE POLICY "audit_select_admin" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

-- Solo se insertan via triggers (SECURITY DEFINER)
CREATE POLICY "audit_insert_system" ON public.audit_logs
  FOR INSERT WITH CHECK (public.is_admin());

-- ============================================================
-- FUNCIÓN PÚBLICA: obtener ranking con caché
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_ranking(limit_n INT DEFAULT 10)
RETURNS TABLE (
  position       BIGINT,
  id             UUID,
  stage_name     TEXT,
  city           TEXT,
  profile_image  TEXT,
  status         TEXT,
  total_votes    BIGINT,
  votes_this_week BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROW_NUMBER() OVER (ORDER BY p.total_votes DESC) AS position,
    p.id,
    p.stage_name,
    p.city,
    p.profile_image,
    p.status,
    p.total_votes,
    COALESCE(vw.wvotes, 0)::BIGINT AS votes_this_week
  FROM public.participants p
  LEFT JOIN (
    SELECT v.participant_id, SUM(v.quantity)::BIGINT AS wvotes
    FROM public.votes v
    WHERE v.week_number = (
      SELECT (value::text)::int FROM public.configurations WHERE key = 'current_week'
    )
    GROUP BY v.participant_id
  ) vw ON vw.participant_id = p.id
  WHERE p.status IN ('active', 'finalist')
  ORDER BY p.total_votes DESC
  LIMIT limit_n;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN PÚBLICA: obtener premio acumulado formateado
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_prize_pool()
RETURNS JSONB AS $$
DECLARE
  rec RECORD;
BEGIN
  SELECT total_clp, total_votes, last_updated INTO rec FROM public.prize_pool LIMIT 1;
  RETURN jsonb_build_object(
    'total_clp', rec.total_clp,
    'total_votes', rec.total_votes,
    'formatted', '$' || TO_CHAR(rec.total_clp, 'FM999,999,999') || ' CLP',
    'last_updated', rec.last_updated
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- FUNCIÓN: detectar transacciones sospechosas (anti-fraude)
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_fraud_signals(p_ip INET, p_tx_window_minutes INT DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
  tx_count INT;
  vote_count BIGINT;
  is_suspicious BOOLEAN := FALSE;
BEGIN
  -- Contar transacciones de la misma IP en la ventana de tiempo
  SELECT COUNT(*), COALESCE(SUM(vote_quantity), 0)
  INTO tx_count, vote_count
  FROM public.transactions
  WHERE ip_address = p_ip
    AND created_at > NOW() - (p_tx_window_minutes || ' minutes')::INTERVAL
    AND status IN ('completed', 'pending');

  IF tx_count >= 5 OR vote_count >= 200 THEN
    is_suspicious := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'ip', p_ip,
    'transactions_in_window', tx_count,
    'votes_in_window', vote_count,
    'is_suspicious', is_suspicious,
    'window_minutes', p_tx_window_minutes
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================
-- HABILITAR REALTIME PARA TABLAS CLAVE
-- ============================================================
-- Ejecutar en Supabase Dashboard > Database > Replication
-- O con los siguientes comandos:

ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prize_pool;
ALTER PUBLICATION supabase_realtime ADD TABLE public.participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.gala_events;

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================
