'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Animadora {
  id?: string;
  name: string;
  role: 'reality' | 'backstage' | 'mirror';
  profile_image: string;
  description: string;
}

export default function AnimadoraForm({
  animadora,
  onClose,
  onSaved,
}: {
  animadora?: Animadora | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!animadora;
  const [name, setName] = useState(animadora?.name || '');
  const [role, setRole] = useState<'reality' | 'backstage' | 'mirror'>(animadora?.role || 'reality');
  const [description, setDescription] = useState(animadora?.description || '');
  const [profileImage, setProfileImage] = useState(animadora?.profile_image || '');
  const [saving, setSaving] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { name, role, profile_image: profileImage, description };
    let error;
    if (isEdit && animadora?.id) {
      const { error: err } = await supabase.from('animadoras').update(payload).eq('id', animadora.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('animadoras').insert(payload);
      error = err;
    }
    setSaving(false);
    if (error) {
      alert('Error al guardar: ' + error.message);
    } else {
      onSaved();
      onClose();
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#1a1a24', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: '#D4AF37', marginBottom: '1rem' }}>{isEdit ? 'Editar Animadora' : 'Nueva Animadora'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Nombre</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as any)} style={inputStyle}>
              <option value="reality">Animadora del Reality</option>
              <option value="backstage">Animadora del Backstage</option>
              <option value="mirror">Animadora Detrás del Espejo</option>
            </select>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem' }}>Foto de Perfil</label>
            {profileImage && (
              <img
                src={profileImage}
                alt="Preview"
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem', border: '2px solid #D4AF37' }}
              />
            )}
            <input type="file" accept="image/*" style={{ ...inputStyle, padding: '0.25rem' }} onChange={handleImageChange} />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>Cancelar</button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: '#fff',
  marginTop: '0.25rem',
};

const btnPrimary: React.CSSProperties = {
  background: '#D4AF37',
  color: '#000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600,
};

const btnSecondary: React.CSSProperties = {
  background: 'transparent',
  color: '#9ca3af',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
};
