'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ParticipantForm from '@/components/ParticipantForm';

export default function ParticipantesAdmin() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editParticipant, setEditParticipant] = useState<any>(null);

  const loadParticipants = async () => {
    setLoading(true);
    const { data } = await supabase.from('participants').select('*').order('stage_name', { ascending: true });
    if (data) setParticipants(data);
    setLoading(false);
  };

  useEffect(() => {
    loadParticipants();
    const channel = supabase
      .channel('participants_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'participants' }, () => {
        loadParticipants();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este participante?')) return;
    const { error } = await supabase.from('participants').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      // Log en auditoría
      await supabase.from('audit_logs').insert({
        action: 'DELETE_PARTICIPANT',
        target_table: 'participants',
        details: { participant_id: id }
      });
      loadParticipants();
    }
  };

  const openEdit = (p: any) => {
    setEditParticipant(p);
    setShowForm(true);
  };

  const closeForm = () => {
    setEditParticipant(null);
    setShowForm(false);
  };

  const afterSave = () => {
    loadParticipants();
  };

  return (
    <div>
      <h1 className="section-title reveal" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Gestión de Participantes</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setShowForm(true)} className="btn-reality btn-reality-gold" style={{
          background: '#D4AF37',
          color: '#000',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600'
        }}>
          + Nuevo Participante
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af' }}>Cargando participantes...</p>
      ) : participants.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No hay participantes registrados.</p>
      ) : (
        <div className="glass-premium" style={{ borderRadius: '12px', overflow: 'hidden', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre Artístico</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ciudad</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Estado</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="hover-3d" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '0.75rem' }}>{p.stage_name}</td>
                  <td style={{ padding: '0.75rem' }}>{p.city}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: p.status === 'active' ? '#10b981' : p.status === 'finalist' ? '#D4AF37' : p.status === 'winner' ? '#FF1493' : '#ef4444',
                      fontSize: '0.8rem'
                    }}>{p.status.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(p)} style={{
                      background: '#374151',
                      color: '#fff',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}>Editar</button>
                    <button onClick={() => handleDelete(p.id)} style={{
                      background: '#ef4444',
                      color: '#fff',
                      border: 'none',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ParticipantForm
          participant={editParticipant}
          onClose={closeForm}
          onSaved={afterSave}
        />
      )}
    </div>
  );
}
