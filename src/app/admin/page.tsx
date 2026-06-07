'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function AdminHome() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/auth/signin';
        return;
      }
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_, sess) => {
      if (!sess) window.location.href = '/auth/signin';
      else setSession(sess);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: '#D4AF37' }}>
      Cargando...
    </div>
  );

  const sections = [
    { name: 'Dashboard', href: '/admin/dashboard', desc: 'Visión general y métricas en tiempo real', icon: '📊', color: '#7B2CBF' },
    { name: 'Votaciones', href: '/admin/votaciones', desc: 'Abrir / cerrar votaciones y ver resultados', icon: '⭐', color: '#D4AF37' },
    { name: 'Etapas', href: '/admin/etapas', desc: 'Controlar semanas y etapas de la competencia', icon: '📅', color: '#FF1493' },
    { name: 'Participantes', href: '/admin/participantes', desc: 'Crear, editar y gestionar participantes', icon: '👑', color: '#10B981' },
    { name: 'Galas', href: '/admin/galas', desc: 'Administrar galas y eventos del concurso', icon: '🎭', color: '#F59E0B' },
    { name: 'Inscripciones', href: '/admin/inscripciones', desc: 'Revisar postulaciones de nuevas drags', icon: '📝', color: '#3B82F6' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Bienvenido
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '0.25rem',
        }}>
          Panel Administrativo
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>
          {session?.user?.email}
        </p>
      </div>

      {/* Divider */}
      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />

      {/* Cards de secciones */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {sections.map((s) => (
          <Link
            key={s.name}
            href={s.href}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px',
                padding: '1.5rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = `rgba(${s.color === '#D4AF37' ? '212,175,55' : s.color === '#FF1493' ? '255,20,147' : s.color === '#7B2CBF' ? '123,44,191' : s.color === '#10B981' ? '16,185,129' : '245,158,11'}, 0.08)`;
                el.style.borderColor = s.color;
                el.style.transform = 'translateY(-4px)';
                el.style.boxShadow = `0 12px 40px ${s.color}30`;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.borderColor = 'rgba(255,255,255,0.08)';
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#fff',
                marginBottom: '0.5rem',
              }}>
                {s.name}
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.5 }}>{s.desc}</p>
              <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: s.color, fontWeight: 600 }}>
                → Entrar
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
