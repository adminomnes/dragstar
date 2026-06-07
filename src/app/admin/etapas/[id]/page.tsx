'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function EditarEtapaPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  
  const [form, setForm] = useState({
    numero: '',
    nombre: '',
    descripcion: '',
    fecha: '',
    hora: '',
    status: 'upcoming' as 'upcoming' | 'active' | 'finished',
    orden: '',
    image_url: '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    async function fetchEtapa() {
      const { data, error } = await supabase
        .from('etapas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setMsg('Error al cargar la etapa: ' + error.message);
      } else if (data) {
        setForm({
          numero: data.numero.toString(),
          nombre: data.nombre,
          descripcion: data.descripcion || '',
          fecha: data.fecha || '',
          hora: data.hora || '',
          status: data.status,
          orden: data.orden.toString(),
          image_url: data.image_url || '',
        });
      }
      setLoading(false);
    }
    fetchEtapa();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    let finalImageUrl = form.image_url;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('etapas_flyers')
        .upload(fileName, file);

      if (uploadError) {
        setMsg('Error al subir el flyer: ' + uploadError.message);
        setSaving(false);
        return;
      }

      const { data } = supabase.storage
        .from('etapas_flyers')
        .getPublicUrl(fileName);
        
      finalImageUrl = data.publicUrl;
    }
    
    const { error } = await supabase
      .from('etapas')
      .update({
        numero: Number(form.numero),
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        fecha: form.fecha || null,
        hora: form.hora || null,
        status: form.status,
        orden: Number(form.orden) || Number(form.numero),
        image_url: finalImageUrl || null,
      })
      .eq('id', id);

    if (error) {
      setMsg('Error al actualizar la etapa: ' + error.message);
      setSaving(false);
    } else {
      router.push('/admin/etapas');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.875rem 1rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(212,175,55,0.2)',
    borderRadius: '8px', color: '#fff', fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif", outline: 'none', boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  };
  
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#D4AF37',
    marginBottom: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase',
  };
  
  const focus = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.boxShadow = '0 0 16px rgba(212,175,55,0.15)'; };
  const blur  = (e: React.FocusEvent<any>) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; e.currentTarget.style.boxShadow = 'none'; };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF37' }}>Cargando datos de la etapa...</div>;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/admin/etapas" style={{ color: '#FF1493', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1rem' }}>
          ← Volver a Etapas
        </Link>
        <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administración</p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Editar Etapa {form.numero}
        </h1>
      </div>

      <div style={{ width: '60px', height: '2px', background: 'linear-gradient(90deg, #D4AF37, transparent)', marginBottom: '2rem' }} />

      <form onSubmit={handleSubmit} style={{ maxWidth: '600px' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.12)', borderRadius: '16px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>N° de Gala</label>
              <input type="number" name="numero" value={form.numero} onChange={handleChange} required min="1" max="20" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
            <div>
              <label style={labelStyle}>Orden</label>
              <input type="number" name="orden" value={form.orden} onChange={handleChange} min="1" style={inputStyle} onFocus={focus} onBlur={blur} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Nombre de la Etapa</label>
            <input type="text" name="nombre" value={form.nombre} onChange={handleChange} required style={inputStyle} onFocus={focus} onBlur={blur} />
          </div>

          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: 'vertical' }} onFocus={focus} onBlur={blur} />
          </div>

          {/* Flyer Upload */}
          <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(212,175,55,0.3)' }}>
            <label style={labelStyle}>Flyer de la Gala (Opcional)</label>
            
            {form.image_url && !file && (
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Flyer actual:</p>
                <img src={form.image_url} alt="Flyer actual" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            )}
            
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              style={{ color: '#fff', fontSize: '0.9rem', marginTop: '0.5rem' }} 
            />
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>Selecciona una nueva imagen para reemplazar la actual. Formatos: JPG, PNG.</p>
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
            <label style={labelStyle}>Estado</label>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={saving} style={{ flex: 1, padding: '1rem', background: saving ? 'rgba(212,175,55,0.3)' : 'linear-gradient(135deg, #7B2CBF, #FF1493)', color: '#fff', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '1rem', borderRadius: '8px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 4px 20px rgba(123,44,191,0.35)' }}>
              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
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
