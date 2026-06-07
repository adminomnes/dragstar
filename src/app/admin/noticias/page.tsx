'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  is_published: boolean;
  created_at: string;
};

type Gala = {
  id: string;
  name: string;
  date: string;
};

type Participant = {
  id: string;
  stage_name: string;
};

export default function AdminNoticiasPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'media' | 'results'>('news');
  
  // Data lists
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [galas, setGalas] = useState<Gala[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states - News
  const [newsTitle, setNewsTitle] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsCover, setNewsCover] = useState('');
  const [newsPublished, setNewsPublished] = useState(true);

  // Form states - Media (Flyers/Videos)
  const [selectedGalaId, setSelectedGalaId] = useState('');
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');

  // Form states - Results
  const [resultGalaId, setResultGalaId] = useState('');
  const [resultParticipantId, setResultParticipantId] = useState('');
  const [resultType, setResultType] = useState<'winner' | 'top3' | 'safe' | 'btm3' | 'eliminated' | 'immune'>('eliminated');

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    // Load News
    const { data: newsData } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (newsData) setNewsList(newsData);

    // Load Galas
    const { data: galasData } = await supabase.from('galas').select('id, name, date').order('date', { ascending: false });
    if (galasData) {
      setGalas(galasData);
      if (galasData.length > 0) {
        setSelectedGalaId(galasData[0].id);
        setResultGalaId(galasData[0].id);
      }
    }

    // Load Participants
    const { data: partData } = await supabase.from('participants').select('id, stage_name').order('stage_name', { ascending: true });
    if (partData) {
      setParticipants(partData);
      if (partData.length > 0) {
        setResultParticipantId(partData[0].id);
      }
    }
    setLoading(false);
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle) return alert('Por favor ingresa un título');

    const slug = newsTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const { error } = await supabase.from('news').insert({
      title: newsTitle,
      slug,
      excerpt: newsExcerpt,
      content: newsContent,
      cover_image: newsCover || 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80',
      is_published: newsPublished,
      published_at: newsPublished ? new Date().toISOString() : null,
    });

    if (error) {
      alert('Error al guardar noticia: ' + error.message);
    } else {
      alert('Noticia publicada exitosamente!');
      setNewsTitle('');
      setNewsExcerpt('');
      setNewsContent('');
      setNewsCover('');
      loadAllData();
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm('¿Seguro que deseas eliminar esta noticia?')) return;
    const { error } = await supabase.from('news').delete().eq('id', id);
    if (error) alert('Error al eliminar: ' + error.message);
    else loadAllData();
  };

  const handleSaveMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return alert('Por favor ingresa la URL de la imagen o video');

    const { error } = await supabase.from('gala_media').insert({
      gala_id: selectedGalaId,
      media_type: mediaType,
      url: mediaUrl,
      caption: mediaCaption,
    });

    if (error) {
      alert('Error al guardar flyer/video: ' + error.message);
    } else {
      alert('Contenido multimedia asociado a la gala exitosamente!');
      setMediaUrl('');
      setMediaCaption('');
    }
  };

  const handleSaveResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultGalaId || !resultParticipantId) return alert('Selecciona gala y participante');

    // Si el resultado es 'eliminated', actualizamos también el status del participante en la tabla `participants`
    if (resultType === 'eliminated') {
      const { error: partError } = await supabase
        .from('participants')
        .update({ status: 'eliminated' })
        .eq('id', resultParticipantId);
      if (partError) console.error('Error al actualizar participante:', partError);
    }

    const { error } = await supabase.from('gala_results').insert({
      gala_id: resultGalaId,
      participant_id: resultParticipantId,
      result: resultType,
    });

    if (error) {
      alert('Error al guardar resultado: ' + error.message);
    } else {
      alert('Resultado de la gala guardado exitosamente!');
      loadAllData();
    }
  };

  return (
    <div className="reveal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: '#FF1493', fontSize: '0.75rem', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Administración</p>
          <h1 className="section-title text-glow-gold" style={{ fontSize: '2rem', fontWeight: 900 }}>Gestión de Noticias y Novedades</h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('news')}
          className={`btn-reality ${activeTab === 'news' ? 'btn-reality-gold' : ''}`}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: activeTab === 'news' ? 'linear-gradient(135deg, #D4AF37, #F0C93A)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'news' ? '#000' : '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          📰 Publicar Noticia
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`btn-reality ${activeTab === 'media' ? 'btn-reality-gold' : ''}`}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: activeTab === 'media' ? 'linear-gradient(135deg, #D4AF37, #F0C93A)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'media' ? '#000' : '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🖼️ Flyers y Videos de Galas
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`btn-reality ${activeTab === 'results' ? 'btn-reality-gold' : ''}`}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: activeTab === 'results' ? 'linear-gradient(135deg, #D4AF37, #F0C93A)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'results' ? '#000' : '#fff',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          💀 Eliminada de la Semana
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#D4AF37' }}>Cargando datos...</div>
      ) : (
        <div>
          {/* TAB 1: NEWS */}
          {activeTab === 'news' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              {/* Formulario */}
              <form onSubmit={handleCreateNews} className="glass-premium" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ color: '#D4AF37', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Redactar Comunicado Oficial</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Título de la Noticia</label>
                  <input
                    type="text"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder="Ej. ¡Revelado el jurado de la gala 3!"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Resumen Corto (Excerpt)</label>
                  <input
                    type="text"
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder="Breve descripción para la vista rápida..."
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Contenido Completo (HTML o Texto)</label>
                  <textarea
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    rows={6}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', resize: 'vertical' }}
                    placeholder="Escribe la noticia aquí..."
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>URL de Imagen de Portada</label>
                  <input
                    type="text"
                    value={newsCover}
                    onChange={(e) => setNewsCover(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={newsPublished}
                    onChange={(e) => setNewsPublished(e.target.checked)}
                    id="published"
                  />
                  <label htmlFor="published" style={{ color: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}>Publicar inmediatamente en la web pública</label>
                </div>

                <button type="submit" className="btn-primary btn-reality-gold" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                  📢 Publicar Noticia
                </button>
              </form>

              {/* Lista */}
              <div className="glass-premium" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Noticias Publicadas</h3>
                {newsList.length === 0 ? (
                  <p style={{ color: '#6b7280' }}>No hay noticias redactadas.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {newsList.map((n) => (
                      <div key={n.id} className="hover-3d" style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <img src={n.cover_image} alt={n.title} style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{n.title}</h4>
                          <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>{n.excerpt}</p>
                          <span style={{ fontSize: '0.65rem', color: n.is_published ? '#10b981' : '#ef4444', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {n.is_published ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteNews(n.id)} style={{ alignSelf: 'center', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MEDIA */}
          {activeTab === 'media' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <form onSubmit={handleSaveMedia} className="glass-premium" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ color: '#D4AF37', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Asociar Flyer o Video a Gala</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Seleccionar Gala</label>
                  <select
                    value={selectedGalaId}
                    onChange={(e) => setSelectedGalaId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    {galas.map((g) => (
                      <option key={g.id} value={g.id}>{g.name} ({new Date(g.date).toLocaleDateString('es-CL')})</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Tipo de Media</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input type="radio" name="mediaType" checked={mediaType === 'photo'} onChange={() => setMediaType('photo')} />
                      Flyer / Foto
                    </label>
                    <label style={{ color: '#fff', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                      <input type="radio" name="mediaType" checked={mediaType === 'video'} onChange={() => setMediaType('video')} />
                      Video de Gala (Youtube)
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>URL del Contenido</label>
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder={mediaType === 'photo' ? 'https://images.unsplash.com/...' : 'https://www.youtube.com/watch?v=...'}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Pie de Foto / Título del Video</label>
                  <input
                    type="text"
                    value={mediaCaption}
                    onChange={(e) => setMediaCaption(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                    placeholder="Ej. Flyer Oficial Gala de Eliminación 3"
                  />
                </div>

                <button type="submit" className="btn-primary btn-reality-gold" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                  🖼️ Registrar Multimedia
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: RESULTS */}
          {activeTab === 'results' && (
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <form onSubmit={handleSaveResult} className="glass-premium" style={{ padding: '2rem', borderRadius: '12px' }}>
                <h3 style={{ color: '#D4AF37', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Registrar Eliminada o Estado Semanal</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Seleccionar Gala / Semana</label>
                  <select
                    value={resultGalaId}
                    onChange={(e) => setResultGalaId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    {galas.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Seleccionar Reina</label>
                  <select
                    value={resultParticipantId}
                    onChange={(e) => setResultParticipantId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    {participants.map((p) => (
                      <option key={p.id} value={p.id}>{p.stage_name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#9ca3af', marginBottom: '0.5rem', fontSize: '0.85rem' }}>Resultado de la Gala</label>
                  <select
                    value={resultType}
                    onChange={(e) => setResultType(e.target.value as any)}
                    style={{ width: '100%', padding: '0.75rem', background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="eliminated">💀 Eliminada de la Gala</option>
                    <option value="winner">👑 Ganadora del Desafío</option>
                    <option value="immune">🛡️ Inmune / Favorita</option>
                    <option value="top3">⭐ Top 3 Mejor Evaluada</option>
                    <option value="btm3">⚠️ Bottom 3 (Riesgo)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary btn-reality-gold" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: 'none', background: 'linear-gradient(135deg, #D4AF37, #F0C93A)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>
                  💀 Registrar Resultado
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
