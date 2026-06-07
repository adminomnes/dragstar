// src/app/admin/galas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Gala = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};

const statusConfig = {
  scheduled: { label: 'Programada', color: '#3B82F6', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)' },
  completed: { label: 'Completada', color: '#10B981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
  cancelled: { label: 'Cancelada',  color: '#EF4444', bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)'  },
};

export default function GalasPage() {
  const [galas, setGalas] = useState<Gala[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchGalas() {
    const { data, error } = await supabase.from('galas').select('*').order('date', { ascending: true });
    if (!error) setGalas(data as Gala[]);
    setLoading(false);
  }

  useEffect(() => { fetchGalas(); }, []);

  async function deleteGala(id: string) {
    if (!confirm('¿Estás seguro de eliminar esta gala?')) return;
    const { error } = await supabase.from('galas').delete().eq('id', id);
    if (error) alert('Error al eliminar la gala');
    else fetchGalas();
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#D4AF37' }}>
      Cargando galas...
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Administración
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '2rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Gestión de Galas
          </h1>
        </div>

        <Link
          href="/admin/galas/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            background: 'linear-gradient(135deg, #7B2CBF, #FF1493)',
            color: '#fff',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 4px 20px rgba(123,44,191,0.35)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(255,20,147,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(123,44,191,0.35)';
          }}
        >
          🎭 + Nueva Gala
        </Link>
      </div>

      {/* Divider */}
      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />

      {/* Tabla / Lista */}
      {galas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(212,175,55,0.1)',
          borderRadius: '12px',
          color: '#6b7280',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎭</div>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: '#9ca3af' }}>No hay galas registradas</p>
          <p style={{ fontSize: '0.85rem' }}>Crea la primera gala con el botón de arriba</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Header de la tabla */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(212,175,55,0.06)',
            borderRadius: '8px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#D4AF37',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            <span>Nombre</span>
            <span>Fecha</span>
            <span>Hora</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {/* Filas */}
          {galas.map((g) => {
            const st = statusConfig[g.status] || statusConfig.scheduled;
            return (
              <div
                key={g.id}
                className="glass-premium hover-3d"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                  gap: '1rem',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)';
                  e.currentTarget.style.background = 'rgba(212,175,55,0.04)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                }}
              >
                {/* Nombre */}
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: '#fff', fontSize: '1rem' }}>
                    {g.name}
                  </p>
                  {g.description && (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>{g.description}</p>
                  )}
                </div>

                {/* Fecha */}
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  {new Date(g.date + 'T00:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>

                {/* Hora */}
                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                  {g.time?.slice(0, 5)}
                </span>

                {/* Estado */}
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '99px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  color: st.color,
                  background: st.bg,
                  border: `1px solid ${st.border}`,
                  width: 'fit-content',
                }}>
                  {st.label}
                </span>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/admin/galas/${g.id}`}
                    style={{
                      padding: '0.4rem 0.9rem',
                      background: 'rgba(212,175,55,0.12)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      borderRadius: '6px',
                      color: '#D4AF37',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.22)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(212,175,55,0.12)'}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteGala(g.id)}
                    style={{
                      padding: '0.4rem 0.9rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      borderRadius: '6px',
                      color: '#EF4444',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
