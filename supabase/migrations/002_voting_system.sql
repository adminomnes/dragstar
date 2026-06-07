-- Drop old tables if they exist to avoid conflicts (optional but recommended since this replaces the old schema)
-- We will just focus on creating the new tables with IF NOT EXISTS.

-- 1. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id)
);

-- 2. Participants Table
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_name TEXT NOT NULL,
    real_name TEXT, -- Solo visible para admins (manejado por RLS o API)
    profile_image TEXT,
    gallery_urls TEXT[] DEFAULT '{}',
    bio TEXT,
    city TEXT,
    social_links JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'eliminated', 'finalist', 'winner')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Competition Stages
CREATE TABLE IF NOT EXISTS public.competition_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_number INT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique index to ensure only one active stage at a time
CREATE UNIQUE INDEX IF NOT EXISTS one_active_stage_idx ON public.competition_stages (status) WHERE status = 'active';

-- 4. Vote Settings (Singleton)
CREATE TABLE IF NOT EXISTS public.vote_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    is_open BOOLEAN NOT NULL DEFAULT false,
    scheduled_open TIMESTAMPTZ,
    scheduled_close TIMESTAMPTZ,
    updated_by_admin UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default row
INSERT INTO public.vote_settings (id, is_open) VALUES (1, false) ON CONFLICT (id) DO NOTHING;

-- 5. Votes Table
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES public.competition_stages(id) ON DELETE CASCADE,
    amount INT NOT NULL DEFAULT 1 CHECK (amount > 0),
    payment_status TEXT NOT NULL DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed')),
    transaction_id TEXT, -- Para referenciar Webpay/Flow/MP
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Weekly Rankings
CREATE TABLE IF NOT EXISTS public.weekly_rankings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_id UUID NOT NULL REFERENCES public.competition_stages(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    total_votes BIGINT NOT NULL DEFAULT 0,
    position INT,
    previous_position INT,
    is_favorite BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(stage_id, participant_id)
);

-- 7. Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Vote Logs (Detailed tracking for votes)
CREATE TABLE IF NOT EXISTS public.vote_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vote_id UUID REFERENCES public.votes(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==========================================
-- VIEWS
-- ==========================================

-- General Ranking View (Realtime compatible)
CREATE OR REPLACE VIEW public.general_rankings AS
SELECT 
    p.id AS participant_id,
    p.stage_name,
    p.status,
    p.city,
    p.profile_image,
    COALESCE(SUM(v.amount) FILTER (WHERE v.payment_status = 'completed'), 0) AS total_votes,
    RANK() OVER (ORDER BY COALESCE(SUM(v.amount) FILTER (WHERE v.payment_status = 'completed'), 0) DESC) AS position
FROM public.participants p
LEFT JOIN public.votes v ON p.id = v.participant_id
GROUP BY p.id, p.stage_name, p.status, p.city, p.profile_image;

-- ==========================================
-- TRIGGERS & FUNCTIONS
-- ==========================================

-- Trigger Function: Update Weekly Rankings on Vote Insert
CREATE OR REPLACE FUNCTION public.update_weekly_ranking_on_vote()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'completed' THEN
        -- Upsert total votes into weekly_rankings
        INSERT INTO public.weekly_rankings (stage_id, participant_id, total_votes)
        VALUES (NEW.stage_id, NEW.participant_id, NEW.amount)
        ON CONFLICT (stage_id, participant_id)
        DO UPDATE SET 
            total_votes = public.weekly_rankings.total_votes + EXCLUDED.total_votes,
            updated_at = now();
            
        -- Recalculate positions and favorite for the stage
        WITH ranked AS (
            SELECT 
                id,
                RANK() OVER (ORDER BY total_votes DESC) as new_pos
            FROM public.weekly_rankings
            WHERE stage_id = NEW.stage_id
        )
        UPDATE public.weekly_rankings wr
        SET 
            previous_position = wr.position,
            position = r.new_pos,
            is_favorite = (r.new_pos = 1)
        FROM ranked r
        WHERE wr.id = r.id AND wr.stage_id = NEW.stage_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_vote_completed
AFTER INSERT OR UPDATE OF payment_status ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.update_weekly_ranking_on_vote();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vote_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function para chequear si el auth.user es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for Participants
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.participants FOR SELECT USING (true);

CREATE POLICY "Only admins can modify participants." 
ON public.participants FOR ALL USING (public.is_admin());

-- Policies for Competition Stages
CREATE POLICY "Stages are viewable by everyone." 
ON public.competition_stages FOR SELECT USING (true);

CREATE POLICY "Only admins can modify stages." 
ON public.competition_stages FOR ALL USING (public.is_admin());

-- Policies for Vote Settings
CREATE POLICY "Vote settings are viewable by everyone." 
ON public.vote_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can modify vote settings." 
ON public.vote_settings FOR ALL USING (public.is_admin());

-- Policies for Weekly Rankings
CREATE POLICY "Weekly rankings are viewable by everyone." 
ON public.weekly_rankings FOR SELECT USING (true);

-- Policies for Votes
CREATE POLICY "Public can view anonymous vote amounts if needed" 
ON public.votes FOR SELECT USING (true);

-- (Votes are inserted mostly by Service Role through API to validate payments, so we don't allow anon inserts directly to table)
CREATE POLICY "Admins can view and manage all votes." 
ON public.votes FOR ALL USING (public.is_admin());

-- Policies for Audit Logs
CREATE POLICY "Only admins can view audit logs." 
ON public.audit_logs FOR SELECT USING (public.is_admin());

-- Admins can view own profile
CREATE POLICY "Admins can view own role" 
ON public.admins FOR SELECT USING (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.vote_settings;
alter publication supabase_realtime add table public.weekly_rankings;
alter publication supabase_realtime add table public.participants;
alter publication supabase_realtime add table public.competition_stages;
