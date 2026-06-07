// src/app/api/auth/signin/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Endpoint que recibe { email, password } y crea una sesión en Supabase.
 * Si el login es correcto, se devuelven cookies de sesión para que el
 * cliente pueda recuperar la sesión con supabase.auth.getSession().
 */
export async function POST(request: Request) {
  const { email, password } = await request.json();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    );
  }

  const { session } = data;
  const response = NextResponse.json({ user: session?.user });

  if (session) {
    // Guardamos los tokens como cookies httpOnly para que el cliente los
    // incluya automáticamente en futuras peticiones al backend.
    response.cookies.set('sb-access-token', session.access_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    response.cookies.set('sb-refresh-token', session.refresh_token, {
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  return response;
}
