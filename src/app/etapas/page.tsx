'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import Link from 'next/link';

type Etapa = {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string | null;
  fecha: string | null;
  hora: string | null;
  status: 'upcoming' | 'active' | 'finished';
  orden: number;
  image_url?: string | null;
};

const ETAPAS_DEFAULT: Omit<Etapa, 'id'>[] = [
  { numero: 1, nombre: 'El Despertar de una Estrella', descripcion: 'Las participantes presentan su identidad artística, historia personal y primer show oficial frente al público.', fecha: null, hora: null, status: 'upcoming', orden: 1 },
  { numero: 2, nombre: 'Diosas y Leyendas', descripcion: 'Inspirada en reinas, emperatrices, diosas y personajes mitológicos. Se evalúa caracterización, vestuario y presencia escénica.', fecha: null, hora: null, status: 'upcoming', orden: 2 },
  { numero: 3, nombre: 'Reinas del Fuego', descripcion: 'Looks inspirados en fuego, volcanes, fénix, dragones y elementos de poder. Se busca impacto visual y creatividad.', fecha: null, hora: null, status: 'upcoming', orden: 3 },
  { numero: 4, nombre: 'Divas Eternas', descripcion: 'Interpretación de grandes estrellas de la música y el espectáculo. Se evalúa actitud, interpretación y dominio del escenario.', fecha: null, hora: null, status: 'upcoming', orden: 4 },
  { numero: 5, nombre: 'Mi Historia, Mi Verdad', descripcion: 'Cada participante presenta una performance inspirada en experiencias personales, emociones o momentos importantes de su vida.', fecha: null, hora: null, status: 'upcoming', orden: 5 },
  { numero: 6, nombre: 'Alta Costura del Norte', descripcion: 'Diseños inspirados en el desierto, el océano, minerales y paisajes del norte de Chile. Se evalúa creatividad y elegancia.', fecha: null, hora: null, status: 'upcoming', orden: 6 },
  { numero: 7, nombre: 'Villanas y Heroínas', descripcion: 'Transformación completa en personajes memorables del cine, televisión, fantasía o cultura popular.', fecha: null, hora: null, status: 'upcoming', orden: 7 },
  { numero: 8, nombre: 'Reinas de la Noche', descripcion: 'Inspiración en glamour oscuro, elegancia nocturna, misterio y sofisticación.', fecha: null, hora: null, status: 'upcoming', orden: 8 },
  { numero: 9, nombre: 'Todo o Nada', descripcion: 'SEMIFINAL. Las participantes presentan la mejor performance de toda la temporada utilizando todos los recursos disponibles.', fecha: null, hora: null, status: 'upcoming', orden: 9 },
  { numero: 10, nombre: 'La Gran Coronación', descripcion: 'GRAN FINAL. Pasarela final, show final, última votación y coronación de la ganadora de Drag Star Antofagasta.', fecha: null, hora: null, status: 'upcoming', orden: 10 },
];

const statusConfig = {
  upcoming:  { label: 'Próximamente', color: '#9ca3af',  bg: 'rgba(156,163,175,0.1)',  border: 'rgba(156,163,175,0.25)', icon: '📅' },
  active:    { label: 'En Curso',     color: '#FF1493',  bg: 'rgba(255,20,147,0.12)',  border: 'rgba(255,20,147,0.4)',   icon: '🔴' },
  finished:  { label: 'Finalizada',   color: '#10B981',  bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',   icon: '✅' },
};

// Configuración visual por cada temática oficial
const THEMES: Record<number, { icon: string, primary: string, secondary: string, gradient: string, glow: string }> = {
  1: { icon: '🌟', primary: '#F0C93A', secondary: '#ffffff', gradient: 'linear-gradient(135deg, #F0C93A, #ffffff)', glow: 'rgba(240,201,58,0.5)' },
  2: { icon: '🏛️', primary: '#e2e8f0', secondary: '#D4AF37', gradient: 'linear-gradient(135deg, #e2e8f0, #D4AF37)', glow: 'rgba(212,175,55,0.5)' },
  3: { icon: '🔥', primary: '#ef4444', secondary: '#f97316', gradient: 'linear-gradient(135deg, #ef4444, #f97316)', glow: 'rgba(239,68,68,0.5)' },
  4: { icon: '🎤', primary: '#cbd5e1', secondary: '#fbcfe8', gradient: 'linear-gradient(135deg, #cbd5e1, #fbcfe8)', glow: 'rgba(203,213,225,0.5)' },
  5: { icon: '📖', primary: '#7c3aed', secondary: '#1e3a8a', gradient: 'linear-gradient(135deg, #7c3aed, #1e3a8a)', glow: 'rgba(124,58,237,0.5)' },
  6: { icon: '🏜️', primary: '#b45309', secondary: '#0d9488', gradient: 'linear-gradient(135deg, #b45309, #0d9488)', glow: 'rgba(180,83,9,0.5)' },
  7: { icon: '🦹‍♀️', primary: '#10b981', secondary: '#4c1d95', gradient: 'linear-gradient(135deg, #10b981, #4c1d95)', glow: 'rgba(16,185,129,0.5)' },
  8: { icon: '🌙', primary: '#64748b', secondary: '#0ea5e9', gradient: 'linear-gradient(135deg, #64748b, #0ea5e9)', glow: 'rgba(14,165,233,0.5)' },
  9: { icon: '⚡', primary: '#FF1493', secondary: '#06b6d4', gradient: 'linear-gradient(135deg, #FF1493, #06b6d4)', glow: 'rgba(255,20,147,0.5)' },
  10: { icon: '👑', primary: '#D4AF37', secondary: '#fef08a', gradient: 'linear-gradient(135deg, #D4AF37, #fef08a)', glow: 'rgba(212,175,55,0.8)' },
};

export default function EtapasPage() {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDefault, setUsingDefault] = useState(false);

  useEffect(() => {
    supabase
      .from('etapas')
      .select('*')
      .order('orden', { ascending: true })
      .then(({ data, error }) => {
        if (data && data.length > 0) {
          setEtapas(data as Etapa[]);
        } else {
          // Usar etapas por defecto si no hay datos en BD
          setEtapas(ETAPAS_DEFAULT.map((e, i) => ({ ...e, id: String(i + 1) })));
          setUsingDefault(true);
        }
        setLoading(false);
      });
  }, []);

  const etapaActiva = etapas.find(e => e.status === 'active');
  const finalizadas = etapas.filter(e => e.status === 'finished').length;
  const progreso = Math.round((finalizadas / 10) * 100);
  const proximaEtapa = etapas.find(e => e.status === 'upcoming' && e.fecha);

  return (
    <>
      <Header />
      <main style={{ minHeight: '100vh', background: 'var(--deep-black)', paddingTop: '90px', fontFamily: "'Inter', sans-serif" }}>

        {/* ── HERO ── */}
        <section style={{
          padding: '5rem 1.5rem 3rem',
          textAlign: 'center',
          background: 'radial-gradient(ellipse at top, rgba(123,44,191,0.2) 0%, transparent 70%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(212,175,55,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: '1rem' }}>
              Temporada 1 · Antofagasta
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 5vw, 4rem)', fontWeight: 900, marginBottom: '1rem', lineHeight: 1.1 }}>
              <span style={{ background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Etapas
              </span>{' '}de la Competencia
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '1.1rem', maxWidth: '550px', margin: '0 auto 2.5rem' }}>
              10 galas épicas. 10 semanas de glamour, talento y espectáculo. Una sola ganadora.
            </p>

            {/* Barra de progreso de la temporada */}
            <div className="reveal" style={{ maxWidth: '500px', margin: '0 auto 1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Progreso de la Temporada</span>
                <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700 }}>{finalizadas}/10 galas</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progreso}%`,
                  background: 'linear-gradient(90deg, #7B2CBF, #FF1493, #D4AF37)',
                  borderRadius: '99px',
                  transition: 'width 1s ease',
                  animation: 'neonPulse 2s infinite',
                }} />
              </div>
            </div>

            {/* Stats */}
            <div className="reveal" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem', transitionDelay: '0.2s' }}>
              {[
                { val: finalizadas, label: 'Finalizadas' },
                { val: etapaActiva ? 1 : 0, label: 'En Curso' },
                { val: 10 - finalizadas - (etapaActiva ? 1 : 0), label: 'Por Venir' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, color: '#D4AF37' }}>{s.val}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COUNTDOWN próxima gala ── */}
        {(etapaActiva?.fecha || proximaEtapa?.fecha) && (
          <section className="reveal" style={{ padding: '2rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <div className="glass-premium" style={{
              maxWidth: '700px', width: '100%',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
            }}>
              <p style={{ color: '#FF1493', fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                {etapaActiva ? '🔴 Gala en Curso' : '⏳ Próxima Gala'}
              </p>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.5rem' }}>
                Gala {(etapaActiva || proximaEtapa)?.numero}: {(etapaActiva || proximaEtapa)?.nombre}
              </h3>
              <Countdown targetDate={`${(etapaActiva || proximaEtapa)!.fecha}T${(etapaActiva || proximaEtapa)!.hora || '21:00:00'}`} />
            </div>
          </section>
        )}

        {/* ── TIMELINE ── */}
        <section style={{ padding: '3rem 1.5rem 6rem', maxWidth: '900px', margin: '0 auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF37' }}>Cargando etapas...</div>
          ) : (
            <div style={{ position: 'relative' }}>
              {/* Línea vertical del timeline */}
              <div style={{
                position: 'absolute',
                left: '2rem',
                top: 0,
                bottom: 0,
                width: '2px',
                background: 'linear-gradient(180deg, #7B2CBF, #FF1493, #D4AF37)',
                opacity: 0.3,
              }} />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {etapas.map((etapa) => {
                  const st = statusConfig[etapa.status];
                  const isActive = etapa.status === 'active';
                  const isFinished = etapa.status === 'finished';
                  // Obtener tema visual o usar default si es número > 10
                  const theme = THEMES[etapa.numero] || THEMES[1];

                  return (
                    <div
                      key={etapa.id}
                      className="reveal"
                      style={{
                        display: 'flex',
                        gap: '1.5rem',
                        alignItems: 'flex-start',
                        position: 'relative',
                      }}
                    >
                      {/* Círculo del timeline temático */}
                      <div style={{
                        width: '4rem',
                        height: '4rem',
                        minWidth: '4rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 900,
                        fontSize: '1.4rem',
                        zIndex: 1,
                        background: isActive
                          ? theme.gradient
                          : isFinished
                            ? 'rgba(16,185,129,0.2)'
                            : 'rgba(255,255,255,0.05)',
                        border: isActive
                          ? `2px solid ${theme.primary}`
                          : isFinished
                            ? '2px solid rgba(16,185,129,0.4)'
                            : '2px solid rgba(255,255,255,0.1)',
                        color: isActive ? '#000' : isFinished ? '#10B981' : '#6b7280',
                        boxShadow: isActive ? `0 0 20px ${theme.glow}` : 'none',
                      }}>
                        {isFinished ? '✓' : theme.icon}
                      </div>

                      {/* Card temática */}
                      <div className="hover-3d" style={{
                        flex: 1,
                        background: isActive
                          ? `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.8) 100%)`
                          : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? theme.primary : isFinished ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: isActive ? `0 8px 40px ${theme.glow.replace('0.5', '0.15')}` : 'none',
                        transition: 'all 0.3s ease',
                        marginBottom: '0.5rem',
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        {/* Brillo de fondo sutil si está activo */}
                        {isActive && (
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: theme.gradient }} />
                        )}

                        {/* Header de la card */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                          <div>
                            <p style={{ color: isActive ? theme.primary : '#FF1493', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.3rem', fontWeight: 800 }}>
                              Gala {etapa.numero}
                              {etapa.numero === 9 && ' · Semifinal'}
                              {etapa.numero === 10 && ' · Gran Final'}
                            </p>
                            <h2 style={{
                              fontFamily: "'Playfair Display', serif",
                              fontSize: '1.2rem',
                              fontWeight: 700,
                              color: isActive ? '#fff' : isFinished ? '#d1d5db' : '#9ca3af',
                            }}>
                              {etapa.nombre}
                            </h2>
                          </div>

                          {/* Badge estado */}
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.35rem 0.9rem',
                            borderRadius: '99px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            letterSpacing: '0.06em',
                            color: st.color,
                            background: st.bg,
                            border: `1px solid ${st.border}`,
                            whiteSpace: 'nowrap' as const,
                            animation: isActive ? 'pulse 2s ease-in-out infinite' : 'none',
                          }}>
                            {st.icon} {st.label}
                          </span>
                        </div>

                        {/* Descripción */}
                        <p style={{ color: isActive ? '#d1d5db' : '#6b7280', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: etapa.fecha ? '1rem' : 0 }}>
                          {etapa.descripcion}
                        </p>

                        {/* Fecha */}
                        {etapa.fecha && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem' }}>
                            <span style={{ color: isActive ? theme.primary : '#D4AF37', fontSize: '0.8rem' }}>
                              📅 {new Date(etapa.fecha + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                              {etapa.hora && ` · ⏰ ${etapa.hora.slice(0, 5)} hrs`}
                            </span>
                          </div>
                        )}

                        {/* Flyer Promocional */}
                        {etapa.image_url && (
                          <div style={{ marginTop: '1.5rem', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isActive ? theme.primary : 'rgba(212,175,55,0.15)'}`, boxShadow: `0 4px 20px ${isActive ? theme.glow.replace('0.5', '0.2') : 'rgba(0,0,0,0.5)'}` }}>
                            <img 
                              src={etapa.image_url} 
                              alt={`Flyer Gala ${etapa.numero}: ${etapa.nombre}`} 
                              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
      <Footer />
    </>
  );
}
