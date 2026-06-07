'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Registration = {
  id: string;
  stage_name: string;
  city: string;
  email: string;
  phone: string;
  photo_url: string;
  created_at: string;
};

export default function AdminInscripcionesPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error cargando inscripciones:', error);
      alert('Error cargando inscripciones: ' + error.message);
    } else if (data) {
      setRegistrations(data as Registration[]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta inscripción?')) return;
    const { error } = await supabase.from('registrations').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else loadRegistrations();
  };

  return (
    <div className="reveal">
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administración</p>
        <h1 className="section-title text-glow-gold" style={{ fontSize: '2rem', fontWeight: 900 }}>Inscripciones Recibidas</h1>
      </div>

      <div className="glass-premium" style={{ padding: '2rem', borderRadius: '12px' }}>
        {loading ? (
          <p style={{ color: '#D4AF37' }}>Cargando inscripciones...</p>
        ) : registrations.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No hay inscripciones registradas aún.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {registrations.map((r) => (
              <div key={r.id} className="hover-3d" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden' }}>
                  {r.photo_url ? (
                    <img src={r.photo_url} alt={r.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem' }}>👑</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{r.stage_name}</h4>
                  <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    📍 {r.city} | ✉️ {r.email} | 📱 {r.phone}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                    Recibido el: {new Date(r.created_at).toLocaleDateString()} a las {new Date(r.created_at).toLocaleTimeString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => handleDelete(r.id)}
                    style={{ 
                      background: 'rgba(239,68,68,0.1)', 
                      border: '1px solid rgba(239,68,68,0.3)', 
                      color: '#ef4444', 
                      padding: '0.5rem 1rem', 
                      borderRadius: '6px', 
                      cursor: 'pointer', 
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
