-- Crear tabla de participantes
CREATE TABLE public.participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_name text NOT NULL,
  real_name text,
  city text NOT NULL,
  status text DEFAULT 'active' NOT NULL,
  profile_image text,
  gallery text[] DEFAULT '{}'::text[],
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

-- Política: Todo el mundo puede VER a los participantes (necesario para que el público pueda votar y ver perfiles)
CREATE POLICY "Permitir lectura publica de participantes" ON public.participants
  FOR SELECT
  USING (true);

-- Política: Solo administradores logueados pueden INSERTAR, ACTUALIZAR o BORRAR
CREATE POLICY "Solo admins pueden modificar participantes" ON public.participants
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
