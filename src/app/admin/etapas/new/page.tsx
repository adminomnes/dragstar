// src/app/admin/etapas/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const ETAPAS_OFICIALES = [
  { numero: 1, nombre: 'El Despertar de una Estrella', descripcion: 'Las participantes presentan su identidad artística, historia personal y primer show oficial frente al público.' },
  { numero: 2, nombre: 'Diosas y Leyendas', descripcion: 'Inspirada en reinas, emperatrices, diosas y personajes mitológicos. Se evalúa caracterización, vestuario y presencia escénica.' },
  { numero: 3, nombre: 'Reinas del Fuego', descripcion: 'Looks inspirados en fuego, volcanes, fénix, dragones y elementos de poder. Se busca impacto visual y creatividad.' },
  { numero: 4, nombre: 'Divas Eternas', descripcion: 'Interpretación de grandes estrellas de la música y el espectáculo. Se evalúa actitud, interpretación y dominio del escenario.' },
  { numero: 5, nombre: 'Mi Historia, Mi Verdad', descripcion: 'Cada participante presenta una performance inspirada en experiencias personales, emociones o momentos importantes de su vida.' },
  { numero: 6, nombre: 'Alta Costura del Norte', descripcion: 'Diseños inspirados en el desierto, el océano, minerales y paisajes del norte de Chile. Se evalúa creatividad y elegancia.' },
  { numero: 7, nombre: 'Villanas y Heroínas', descripcion: 'Transformación completa en personajes memorables del cine, televisión, fantasía o cultura popular.' },
  { numero: 8, nombre: 'Reinas de la Noche', descripcion: 'Inspiración en glamour oscuro, elegancia nocturna, misterio y sofisticación.' },
  { numero: 9, nombre: 'Todo o Nada', descripcion: 'SEMIFINAL. Las participantes presentan la mejor performance de toda la temporada utilizando todos los recursos disponibles.' },
  { numero: 10, nombre: 'La Gran Coronación', descripcion: 'GRAN FINAL. Pasarela final, show final, última votación y coronación de la ganadora de Drag Star Antofagasta.' },
];

export default function NuevaEtapaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cargandoOficiales, setCargandoOficiales] = useState(false);
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    numero: '',
    nombre: '',
    descripcion: '',
    fecha: '',
    hora: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'finished',
    orden: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const cargarEtapasOficiales = async () => {
    if (!confirm('¿Cargar las 10 galas oficiales de Drag Star? Esto insertará todas las etapas en la base de datos.')) return;
    setCargandoOficiales(true);
    setMsg('');
    const { error } = await supabase.from('etapas').insert(
      ETAPAS_OFICIALES.map(e => ({
        numero: e.numero,
        nombre: e.nombre,
        descripcion: e.descripcion,
        fecha: null,
        hora: null,
        status: 'upcoming',
        orden: e.numero,
      }))
    );
    if (error) {
      setMsg('Error al cargar etapas: ' + error.message);
    } else {
      router.push('/admin/etapas');
    }
    setCargandoOficiales(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    let finalImageUrl = null;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('etapas_flyers')
        .upload(fileName, file);

      if (uploadError) {
        setMsg('Error al subir el flyer: ' + uploadError.message);
        setLoading(false);
        return;
      }

      const { data } = supabase.storage
        .from('etapas_flyers')
        .getPublicUrl(fileName);
        
      finalImageUrl = data.publicUrl;
    }

    const { error } = await supabase.from('etapas').insert([{
      numero: Number(form.numero),
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      fecha: form.fecha || null,
      hora: form.hora || null,
      status: form.status,
      orden: Number(form.orden) || Number(form.numero),
      image_url: finalImageUrl,
    }]);
    if (error) {
      setMsg('Error al crear la etapa: ' + error.message);
      setLoading(false);
    } else {
      router.push('/admin/etapas');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '8px', color: '#fff', fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#D4AF37',
    marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase',
  };
  const focus = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.boxShadow = '0 0 16px rgba(212,175,55,0.15)'; };
  const blur  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.boxShadow = 'none'; };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/etapas" style={{ color: '#FF1493', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          ← Volver a Etapas
        </Link>
        <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administración</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Nueva Etapa
        </h1>
      </div>

      {/* Botón carga rápida */}
      <div style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ color: '#D4AF37', fontWeight: 600, marginBottom: '0.25rem' }}>⚡ Carga Rápida Oficial</p>
          <p style={{ color: '#9ca3af', fontSize: '0.82rem' }}>Inserta las 10 galas oficiales de Drag Star Antofagasta de una vez.</p>
        </div>
        <button
          onClick={cargarEtapasOficiales}
          disabled={cargandoOficiales}
          style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: cargandoOficiales ? 'not-allowed' : 'pointer', fontSize: '0.9rem', opacity: cargandoOficiales ? 0.6 : 1 }}
        >
          {cargandoOficiales ? '⏳ Cargando...' : '✨ Cargar 10 Galas Oficiales'}
        </button>
      </div>

      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />
      <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>— o crea una etapa personalizada —</p>

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>N° de Gala</label>
              <input type="number" name="numero" value={form.numero} onChange={handleChange} required min="1" max="20" placeholder="1" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input type="number" name="orden" value={form.orden} onChange={handleChange} min="1" placeholder="1" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nombre de la Etapa</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required placeholder="Ej: El Despertar de una Estrella" style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} placeholder="Descripción de la gala..." style={{ ...inputStyle, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
          </div>

          {/* Flyer Upload */}
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(212,175,55,0.3)' }}>
            <label style={labelStyle}>Flyer de la Gala (Opcional)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              style={{ color: '#fff', fontSize: '0.9rem', marginTop: '0.5rem' }} 
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Selecciona una imagen promocional. Formatos: JPG, PNG.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Fecha</label>
              <input type="date" name="fecha" value={form.fecha} onChange={handleChange} style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Hora</label>
              <input type="time" name="hora" value={form.hora} onChange={handleChange} style={{ ...inputStyle, colorScheme: 'dark' }} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Estado Inicial</label>
            <select name="status" value={form.status} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
              <option value="upcoming" style={{ background: '#0d0d1a' }}>📅 Próximamente</option>
              <option value="active"   style={{ background: '#0d0d1a' }}>🔴 En Curso</option>
              <option value="finished" style={{ background: '#0d0d1a' }}>✅ Finalizada</option>
            </select>
          </div>

          {msg && (
            <div style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#EF4444', fontSize: '0.85rem' }}>
              {msg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '1rem', background: loading ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #7B2CBF, #FF1493)', color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(123,44,191,0.35)' }}>
              {loading ? '⏳ Guardando...' : '📅 Crear Etapa'}
            </button>
            <Link href="/admin/etapas" style={{ padding: '1rem 1.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: '#9ca3af', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
