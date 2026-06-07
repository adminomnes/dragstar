'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function RegistrationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [stageName, setStageName] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Asume que hay una tabla 'registrations' configurada en Supabase
    const { error } = await supabase.from('registrations').insert({
      stage_name: stageName,
      city,
      email,
      phone,
      photo_url: photoUrl
    });

    setSaving(false);
    
    if (error) {
      alert('Error al enviar la inscripción: ' + error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div className="modal-content glass-premium" onClick={e => e.stopPropagation()} style={{ background: '#1a1a24', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px', border: '1px solid rgba(212,175,55,0.3)' }}>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <h2 style={{ color: '#D4AF37', marginBottom: '1rem', fontSize: '2rem' }}>¡Inscripción Recibida! ✨</h2>
            <p style={{ color: '#9ca3af', marginBottom: '2rem' }}>Gracias por postular a Drag Star Antofagasta. Nos pondremos en contacto contigo pronto.</p>
            <button onClick={onClose} style={buttonPrimaryStyle}>Cerrar</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#D4AF37', fontSize: '1.5rem', fontWeight: 'bold' }}>Inscripción de Drags 👑</h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Nombre Artístico</label>
                <input required value={stageName} onChange={e => setStageName(e.target.value)} style={inputStyle} placeholder="Ej. Electra Shock" />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Ciudad</label>
                <input required value={city} onChange={e => setCity(e.target.value)} style={inputStyle} placeholder="Ej. Antofagasta" />
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Correo Electrónico</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} placeholder="correo@ejemplo.com" />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Número de Teléfono / WhatsApp</label>
                <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} placeholder="+56 9 1234 5678" />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>URL de Foto (Instagram, Drive, etc.)</label>
                <input value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} style={inputStyle} placeholder="Enlace a tu mejor foto drag" />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={onClose} style={{...buttonSecondaryStyle, flex: 1}}>Cancelar</button>
                <button type="submit" disabled={saving} style={{...buttonPrimaryStyle, flex: 2}}>
                  {saving ? 'Enviando...' : 'Enviar Inscripción ✨'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem',
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  color: '#fff',
  outline: 'none',
};

const buttonPrimaryStyle = {
  background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
  color: '#000',
  border: 'none',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
};

const buttonSecondaryStyle = {
  background: 'transparent',
  color: '#9ca3af',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
};
