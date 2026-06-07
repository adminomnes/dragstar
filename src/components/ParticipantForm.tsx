'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ImageUploader from '@/components/ImageUploader';

export default function ParticipantForm({ participant, onClose, onSaved }) {
  const isEdit = !!participant;
  const [stageName, setStageName] = useState(participant?.stage_name || '');
  const [realName, setRealName] = useState(participant?.real_name || '');
  const [city, setCity] = useState(participant?.city || '');
  const [status, setStatus] = useState(participant?.status || 'active');
  const [profileImage, setProfileImage] = useState(participant?.profile_image || '');
  const [gallery, setGallery] = useState(participant?.gallery || []);
  const [saving, setSaving] = useState(false);
  const [showUploader, setShowUploader] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      stage_name: stageName,
      real_name: realName,
      city,
      status,
      profile_image: profileImage,
      gallery,
    };
    let error;
    if (isEdit) {
      const { error: err } = await supabase.from('participants').update(payload).eq('id', participant.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('participants').insert(payload);
      error = err;
    }
    setSaving(false);
    if (error) {
      alert('Error al guardar el participante: ' + error.message);
    } else {
      onSaved();
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ background: '#1a1a24', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
        <h2 style={{ color: '#D4AF37', marginBottom: '1rem' }}>{isEdit ? 'Editar Participante' : 'Nuevo Participante'}</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Nombre Artístico</label>
            <input value={stageName} onChange={e => setStageName(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Nombre Real (admin)</label>
            <input value={realName} onChange={e => setRealName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Ciudad</label>
            <input value={city} onChange={e => setCity(e.target.value)} required style={inputStyle} />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Estado</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={inputStyle}>
              <option value="active">Activa</option>
              <option value="eliminated">Eliminada</option>
              <option value="finalist">Finalista</option>
              <option value="winner">Ganadora</option>
            </select>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem' }}>Imagen Principal</label>
            {profileImage && (
              <img src={profileImage} alt="Profile" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.5rem', border: '2px solid #D4AF37' }} />
            )}
            <input 
              type="file" 
              accept="image/*"
              style={{ ...inputStyle, padding: '0.25rem' }} 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setProfileImage(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }} 
            />
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', color: '#9ca3af' }}>Galería de Imágenes</label>
            <button type="button" onClick={() => setShowUploader(true)} style={buttonPrimaryStyle}>Agregar Imagen</button>
            {gallery.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem' }}>
                {gallery.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={url} alt={`gallery-${idx}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <button type="button" onClick={() => setGallery(gallery.filter((_, i) => i !== idx))} style={removeBtnStyle}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showUploader && (
            <ImageUploader onUpload={(url) => {
              setGallery([...gallery, url]);
              setShowUploader(false);
            }} />
          )}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={onClose} style={buttonSecondaryStyle}>Cancelar</button>
            <button type="submit" disabled={saving} style={buttonPrimaryStyle}>
              {saving ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.5rem',
  background: '#0a0a0f',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '4px',
  color: '#fff',
  marginTop: '0.25rem'
};

const buttonPrimaryStyle = {
  background: '#D4AF37',
  color: '#000',
  border: 'none',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer',
  fontWeight: 600
};

const buttonSecondaryStyle = {
  background: 'transparent',
  color: '#9ca3af',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '0.5rem 1rem',
  borderRadius: '4px',
  cursor: 'pointer'
};
