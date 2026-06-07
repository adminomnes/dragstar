-- Crea la tabla para las inscripciones
CREATE TABLE public.registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  stage_name text NOT NULL,
  city text NOT NULL,
  email text NOT NULL,
  photo_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilita Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Crea una política para permitir que cualquier persona (anon o autenticado) pueda insertar una inscripción
CREATE POLICY "Permitir inscripciones anonimas" ON public.registrations
  FOR INSERT
  WITH CHECK (true);

-- Opcional: Solo administradores pueden ver la lista de inscripciones
CREATE POLICY "Solo admins ven inscripciones" ON public.registrations
  FOR SELECT
  USING (auth.role() = 'authenticated');
