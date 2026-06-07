'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type Gala = {
  id: string;
  name: string;
  description: string | null;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};

const statusConfig = {
  scheduled: { label: 'Próximamente', color: '#D4AF37', bg: 'rgba(212,175,55,0.12)', border: 'rgba(212,175,55,0.3)', icon: '📅' },
  completed: { label: 'Realizada',    color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', icon: '✅' },
  cancelled: { label: 'Cancelada',    color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',  icon: '❌' },
};

export default function GalasPublicPage() {
  const [galas, setGalas] = useState<Gala[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('galas')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data }) => {
        if (data) setGalas(data as Gala[]);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--deep-black)', paddingTop: '90px', paddingBottom: '4rem' }}>

        {/* Hero de sección */}
        <section style={{
          padding: '4rem 1.5rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(123,44,191,0.15) 0%, transparent 70%)',
          borderBottom: '1px solid rgba(212,175,55,0.1)',
          marginBottom: '4rem',
        }}>
          <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Temporada 1 · Antofagasta
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 900,
            marginBottom: '1rem',
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Galas</span> del Concurso
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>
            Cada semana, las reinas compiten en una gala temática cargada de glamour y espectáculo.
          </p>
        </section>

        <div className="reveal glass-premium" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF37' }}>Cargando galas...</div>
          ) : galas.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '5rem 2rem',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(212,175,55,0.12)',
              borderRadius: '16px',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎭</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#D4AF37', marginBottom: '0.5rem' }}>
                Próximamente
              </h2>
              <p style={{ color: '#6b7280' }}>Las galas serán anunciadas pronto. ¡Mantente atenta!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {galas.map((g, index) => {
                const st = statusConfig[g.status] || statusConfig.scheduled;
                const fechaFormateada = new Date(g.date + 'T00:00:00').toLocaleDateString('es-CL', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                });

                return (
                  <div
                    key={g.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '4rem 1fr auto',
                      alignItems: 'center',
                      gap: '1.5rem',
                      padding: '1.75rem 2rem',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(212,175,55,0.1)',
                      borderRadius: '12px',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)';
                      e.currentTarget.style.background = 'rgba(212,175,55,0.04)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.1)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Número */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '3.5rem',
                        height: '3.5rem',
                        borderRadius: '50%',
                        background: 'rgba(212,175,55,0.1)',
                        border: '1px solid rgba(212,175,55,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900,
                        color: '#D4AF37',
                        fontSize: '1.25rem',
                      }}>
                        {index + 1}
                      </div>
                    </div>

                    {/* Info */}
                    <div>
                      <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.25rem',
                        fontWeight: 700,
                        color: '#fff',
                        marginBottom: '0.4rem',
                      }}>
                        {g.name}
                      </h2>
                      {g.description && (
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '0.6rem' }}>{g.description}</p>
                      )}
                      <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                        📅 {fechaFormateada} · ⏰ {g.time?.slice(0, 5)} hrs
                      </p>
                    </div>

                    {/* Estado */}
                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 1rem',
                        borderRadius: '99px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        color: st.color,
                        background: st.bg,
                        border: `1px solid ${st.border}`,
                      }}>
                        {st.icon} {st.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
