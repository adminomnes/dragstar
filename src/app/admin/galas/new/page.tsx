// src/app/admin/galas/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function NuevaGalaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const { error } = await supabase.from('galas').insert([{
      name: form.name,
      description: form.description || null,
      date: form.date,
      time: form.time,
      status: form.status,
    }]);

    if (error) {
      setMsg('Error al crear la gala: ' + error.message);
      setLoading(false);
    } else {
      router.push('/admin/galas');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: 600 as const,
    color: '#D4AF37',
    marginBottom: '0.5rem',
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = '#D4AF37';
    e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.15)';
  };

  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <Link
          href="/admin/galas"
          style={{ color: '#FF1493', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}
        >
          ← Volver a Galas
        </Link>
        <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Administración
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '2rem',
          fontWeight: 900,
          background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Nueva Gala
        </h1>
      </div>

      {/* Divider */}
      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Nombre */}
          <div>
            <label style={labelStyle}>Nombre de la Gala</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Ej: Gala de Glamour - Semana 1"
              style={inputStyle}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción (opcional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descripción de la gala..."
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={focusHandler}
              onBlur={blurHandler}
            />
          </div>

          {/* Fecha y Hora */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                required
                style={{ ...inputStyle, colorScheme: 'dark' }}
                onFocus={focusHandler}
                onBlur={blurHandler}
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label style={labelStyle}>Estado</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={{ ...inputStyle, cursor: 'pointer' }}
              onFocus={focusHandler}
              onBlur={blurHandler}
            >
              <option value="scheduled" style={{ background: '#0d0d1a' }}>📅 Programada</option>
              <option value="completed" style={{ background: '#0d0d1a' }}>✅ Completada</option>
              <option value="cancelled" style={{ background: '#0d0d1a' }}>❌ Cancelada</option>
            </select>
          </div>

          {/* Mensaje de error */}
          {msg && (
            <div style={{
              padding: '0.875rem 1rem',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '0.85rem',
            }}>
              {msg}
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '1rem',
                background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #7B2CBF, #FF1493)',
                color: '#fff',
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 20px rgba(123,44,191,0.35)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? '⏳ Guardando...' : '🎭 Crear Gala'}
            </button>

            <Link
              href="/admin/galas"
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#9ca3af',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
