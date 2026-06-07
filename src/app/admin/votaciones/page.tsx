'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VotacionesAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('vote_settings').select('is_open').eq('id', 1).single();
      if (data) setIsOpen(data.is_open);
      setLoading(false);
    }
    load();
  }, []);

  const toggleVotaciones = async () => {
    setSaving(true);
    const newState = !isOpen;
    
    const { error } = await supabase
      .from('vote_settings')
      .update({ is_open: newState, updated_at: new Date().toISOString() })
      .eq('id', 1);

    if (!error) {
      setIsOpen(newState);
      // Aquí registraríamos en audit_logs desde una API backend idealmente,
      // pero para el ejemplo de Supabase lo podemos insertar directo si RLS lo permite (rol admin).
      await supabase.from('audit_logs').insert({
        action: newState ? 'OPEN_VOTING' : 'CLOSE_VOTING',
        target_table: 'vote_settings',
        details: { is_open: newState }
      });
    } else {
      alert('Error al actualizar el estado de votaciones.');
    }
    setSaving(false);
  };

  if (loading) return <div>Cargando configuración...</div>;

  return (
    <div>
      <h1 className="section-title reveal" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '2rem' }}>Control de Votaciones</h1>
      
      <div className="glass-premium reveal hover-3d" style={{ background: '#1a1a24', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', maxWidth: 600 }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Estado Global</h3>
        <p style={{ color: '#9ca3af', marginBottom: '2rem', lineHeight: 1.5 }}>
          Al cerrar las votaciones, el botón de "VOTAR" desaparecerá instantáneamente de la página pública para todos los usuarios y la API rechazará cualquier intento de voto.
        </p>

        <div className="glass-premium" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ width: 16, height: 16, borderRadius: '50%', background: isOpen ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${isOpen ? '#10b981' : '#ef4444'}` }} />
             <div>
               <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isOpen ? '#10b981' : '#ef4444' }}>
                 {isOpen ? 'ABIERTAS' : 'CERRADAS'}
               </div>
               <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                 {isOpen ? 'Recibiendo votos en tiempo real' : 'Sistema bloqueado públicamente'}
               </div>
             </div>
          </div>

          <button 
            onClick={toggleVotaciones}
            disabled={saving}
            className="btn-reality"
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              cursor: saving ? 'wait' : 'pointer',
              background: isOpen ? '#ef4444' : '#10b981',
              color: '#fff',
              transition: 'all 0.2s'
            }}
          >
            {saving ? 'Guardando...' : (isOpen ? 'CERRAR VOTACIONES' : 'ABRIR VOTACIONES')}
          </button>
        </div>
      </div>
    </div>
  );
}
