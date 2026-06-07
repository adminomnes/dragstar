'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AnimadoraForm from '@/components/AnimadoraForm';

const roleLabel: Record<string, string> = {
  reality: 'Animadora del Reality',
  backstage: 'Animadora del Backstage',
  mirror: 'Detrás del Espejo',
};

export default function AnimadorasAdmin() {
  const [animadoras, setAnimadoras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editAnimadora, setEditAnimadora] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('animadoras').select('*').order('role').order('name');
    if (data) setAnimadoras(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('animadoras_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animadoras' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta animadora?')) return;
    const { error } = await supabase.from('animadoras').delete().eq('id', id);
    if (error) alert('Error: ' + error.message);
    else load();
  };

  const openEdit = (a: any) => { setEditAnimadora(a); setShowForm(true); };
  const closeForm = () => { setEditAnimadora(null); setShowForm(false); };

  return (
    <div>
      <h1 className="section-title reveal" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Gestión de Animadoras
      </h1>

      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowForm(true)}
          style={{ background: '#D4AF37', color: '#000', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
        >
          + Nueva Animadora
        </button>
      </div>

      {loading ? (
        <p style={{ color: '#9ca3af' }}>Cargando animadoras...</p>
      ) : animadoras.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>No hay animadoras registradas.</p>
      ) : (
        <div className="glass-premium" style={{ borderRadius: '12px', overflow: 'hidden', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Foto</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Rol</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Descripción</th>
                <th style={{ padding: '0.75rem', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {animadoras.map((a) => (
                <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    {a.profile_image ? (
                      <img src={a.profile_image} alt={a.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(212,175,55,0.3)' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', background: '#333', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>?</div>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{a.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', background: a.role === 'reality' ? '#7c3aed' : a.role === 'backstage' ? '#0891b2' : '#be185d', fontSize: '0.8rem' }}>
                      {roleLabel[a.role] || a.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.85rem', maxWidth: '200px' }}>{a.description}</td>
                  <td style={{ padding: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => openEdit(a)} style={{ background: '#374151', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Editar
                    </button>
                    <button onClick={() => handleDelete(a.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <AnimadoraForm animadora={editAnimadora} onClose={closeForm} onSaved={load} />
      )}
    </div>
  );
}
