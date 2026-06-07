// src/app/admin/etapas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Etapa = {
  id: string;
  numero: number;
  nombre: string;
  descripcion: string | null;
  fecha: string | null;
  hora: string | null;
  status: 'upcoming' | 'active' | 'finished';
  orden: number;
};

const statusConfig = {
  upcoming: { label: 'Próximamente', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.25)' },
  active:   { label: 'En Curso',     color: '#FF1493', bg: 'rgba(255,20,147,0.12)', border: 'rgba(255,20,147,0.4)' },
  finished: { label: 'Finalizada',   color: '#10B981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)' },
};

export default function AdminEtapasPage() {
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState<string | null>(null);

  async function fetchEtapas() {
    const { data } = await supabase.from('etapas').select('*').order('orden', { ascending: true });
    if (data) setEtapas(data as Etapa[]);
    setLoading(false);
  }

  useEffect(() => { fetchEtapas(); }, []);

  async function activarEtapa(id: string) {
    if (!confirm('¿Activar esta etapa? La etapa actualmente activa pasará a "Próximamente".')) return;
    setProcesando(id);
    // Desactivar todas
    await supabase.from('etapas').update({ status: 'upcoming' }).eq('status', 'active');
    // Activar esta
    await supabase.from('etapas').update({ status: 'active' }).eq('id', id);
    await fetchEtapas();
    setProcesando(null);
  }

  async function finalizarEtapa(id: string) {
    if (!confirm('¿Marcar esta etapa como finalizada?')) return;
    setProcesando(id);
    await supabase.from('etapas').update({ status: 'finished' }).eq('id', id);
    await fetchEtapas();
    setProcesando(null);
  }

  async function eliminarEtapa(id: string) {
    if (!confirm('¿Eliminar esta etapa? Esta acción no se puede deshacer.')) return;
    setProcesando(id);
    await supabase.from('etapas').delete().eq('id', id);
    await fetchEtapas();
    setProcesando(null);
  }

  const finalizadas = etapas.filter(e => e.status === 'finished').length;
  const progreso = Math.round((finalizadas / Math.max(etapas.length, 1)) * 100);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administración</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Etapas del Concurso
          </h1>
        </div>
        <Link
          href="/admin/etapas/new"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #7B2CBF, #FF1493)', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(123,44,191,0.35)' }}
        >
          📅 + Nueva Etapa
        </Link>
      </div>

      {/* Barra de progreso */}
      <div className="glass-premium hover-3d" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#9ca3af', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progreso de la Temporada</span>
          <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.85rem' }}>{finalizadas} / {etapas.length} galas finalizadas</span>
        </div>
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progreso}%`, background: 'linear-gradient(90deg, #7B2CBF, #FF1493, #D4AF37)', borderRadius: '99px', boxShadow: '0 0 12px rgba(255,20,147,0.4)', transition: 'width 0.8s ease' }} />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[
            { val: finalizadas, label: 'Finalizadas', color: '#10B981' },
            { val: etapas.filter(e => e.status === 'active').length, label: 'Activa', color: '#FF1493' },
            { val: etapas.filter(e => e.status === 'upcoming').length, label: 'Por Venir', color: '#9ca3af' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
              <span style={{ color: s.color, fontSize: '0.8rem', fontWeight: 600 }}>{s.val}</span>
              <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />

      {/* Lista de etapas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF37' }}>Cargando etapas...</div>
      ) : etapas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)', borderRadius: '12px', color: '#6b7280' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>No hay etapas registradas</p>
          <p style={{ fontSize: '0.85rem' }}>Crea la primera etapa o precarga las 10 galas oficiales.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {etapas.map(etapa => {
            const st = statusConfig[etapa.status];
            const isActive = etapa.status === 'active';
            const isProcesando = procesando === etapa.id;

            return (
              <div
                key={etapa.id}
                className="glass-premium hover-3d"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '3rem 1fr auto',
                  alignItems: 'center',
                  gap: '1.25rem',
                  padding: '1.25rem 1.5rem',
                  background: isActive ? 'rgba(255,20,147,0.06)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isActive ? 'rgba(255,20,147,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: '10px',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 4px 20px rgba(255,20,147,0.1)' : 'none',
                }}
              >
                {/* Número */}
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '1rem',
                  background: isActive ? 'linear-gradient(135deg, #7B2CBF, #FF1493)' : 'rgba(212,175,55,0.08)',
                  border: `1px solid ${isActive ? 'rgba(255,20,147,0.4)' : 'rgba(212,175,55,0.2)'}`,
                  color: isActive ? '#fff' : '#D4AF37',
                }}>
                  {etapa.numero}
                </div>

                {/* Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                    <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 700, color: '#fff' }}>
                      {etapa.nombre}
                    </h3>
                    <span style={{
                      padding: '0.2rem 0.65rem', borderRadius: '99px', fontSize: '0.65rem', fontWeight: 700,
                      color: st.color, background: st.bg, border: `1px solid ${st.border}`,
                    }}>
                      {st.label}
                    </span>
                  </div>
                  <p style={{ color: '#6b7280', fontSize: '0.78rem' }}>
                    {etapa.fecha
                      ? `📅 ${new Date(etapa.fecha + 'T00:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}${etapa.hora ? ` · ${etapa.hora.slice(0, 5)} hrs` : ''}`
                      : 'Sin fecha asignada'}
                  </p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {etapa.status === 'upcoming' && (
                    <button
                      onClick={() => activarEtapa(etapa.id)}
                      disabled={isProcesando}
                      style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,20,147,0.12)', border: '1px solid rgba(255,20,147,0.3)', borderRadius: '6px', color: '#FF1493', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isProcesando ? '...' : '▶ Activar'}
                    </button>
                  )}
                  {etapa.status === 'active' && (
                    <button
                      onClick={() => finalizarEtapa(etapa.id)}
                      disabled={isProcesando}
                      style={{ padding: '0.4rem 0.8rem', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px', color: '#10B981', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isProcesando ? '...' : '✓ Finalizar'}
                    </button>
                  )}
                  <Link
                    href={`/admin/etapas/${etapa.id}`}
                    style={{ padding: '0.4rem 0.8rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '6px', color: '#D4AF37', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => eliminarEtapa(etapa.id)}
                    disabled={isProcesando}
                    style={{ padding: '0.4rem 0.8rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#EF4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
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
