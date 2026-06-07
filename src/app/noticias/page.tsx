'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

type NewsItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  published_at: string;
};

type GalaMedia = {
  id: string;
  media_type: 'photo' | 'video';
  url: string;
  caption: string;
  gala_id: string;
};

type Gala = {
  id: string;
  name: string;
};

type Participant = {
  id: string;
  stage_name: string;
  profile_image: string;
  city: string;
};

type EliminatedQueen = {
  galaName: string;
  stageName: string;
  profileImage: string;
  city: string;
};

export default function NoticiasPublicPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [media, setMedia] = useState<GalaMedia[]>([]);
  const [eliminatedQueens, setEliminatedQueens] = useState<EliminatedQueen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      // Fetch news
      const { data: newsData } = await supabase
        .from('news')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });
      
      if (newsData) setNews(newsData as NewsItem[]);

      // Fetch media
      const { data: mediaData } = await supabase
        .from('gala_media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (mediaData) setMedia(mediaData as GalaMedia[]);

      // Fetch eliminated results
      const { data: resultsData } = await supabase
        .from('gala_results')
        .select('*')
        .eq('result', 'eliminated');

      // Fetch galas & participants to map offline
      const { data: galasData } = await supabase.from('galas').select('id, name');
      const { data: partData } = await supabase.from('participants').select('id, stage_name, profile_image, city');

      if (resultsData && galasData && partData) {
        const mapped: EliminatedQueen[] = resultsData.map(res => {
          const gala = galasData.find(g => g.id === res.gala_id);
          const part = partData.find(p => p.id === res.participant_id);
          return {
            galaName: gala?.name || 'Gala',
            stageName: part?.stage_name || 'Participante',
            profileImage: part?.profile_image || 'https://images.unsplash.com/photo-1563240619-44cebfc8ca8a?w=500&q=80',
            city: part?.city || 'Antofagasta',
          };
        });
        setEliminatedQueens(mapped);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '100px', minHeight: '100vh', background: 'var(--deep-black)', color: '#fff' }}>
        
        {/* HERO SECTION */}
        <section style={{ position: 'relative', padding: '4rem 1.5rem', textAlign: 'center', overflow: 'hidden' }}>
          <div className="reveal" style={{ maxWidth: '800px', margin: '0 auto', zIndex: 10, position: 'relative' }}>
            <span style={{ color: '#FF1493', letterSpacing: '0.25em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Novedades & Pasarela</span>
            <h1 className="section-title text-glow-gold" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Noticias de Drag Star
            </h1>
            <div className="section-divider" style={{ margin: '0 auto 2rem auto' }} />
            <p style={{ color: '#d1d5db', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
              Entérate de los chismes oficiales, eliminaciones semanales, fechas de galas y videos exclusivos del reality show.
            </p>
          </div>
        </section>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '6rem', color: '#D4AF37', fontSize: '1.2rem' }}>Cargando pasarela...</div>
        ) : (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem 6rem 1.5rem' }}>
            
            {/* ELIMINADA DE LA SEMANA */}
            {eliminatedQueens.length > 0 && (
              <section style={{ marginBottom: '5rem' }}>
                <h2 className="section-title text-glow-fuchsia" style={{ fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  💀 Eliminadas de la Semana
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {eliminatedQueens.map((eq, idx) => (
                    <div key={idx} className="glass-premium hover-3d" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,20,147,0.25)', background: 'linear-gradient(145deg, rgba(20,10,30,0.8) 0%, rgba(10,10,20,0.9) 100%)' }}>
                      <div style={{ width: '100px', height: '140px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '2px solid rgba(255,20,147,0.5)' }}>
                        <img src={eq.profileImage} alt={eq.stageName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <span style={{ color: '#FF1493', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{eq.galaName}</span>
                        <h3 style={{ fontSize: '1.4rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: '0.2rem 0' }}>{eq.stageName}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.8rem', marginBottom: '0.5rem' }}>De: {eq.city}</p>
                        <span style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', padding: '0.25rem 0.75rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', width: 'fit-content', textTransform: 'uppercase' }}>
                          ELIMINADA
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* NOTICIAS GRID */}
            <section style={{ marginBottom: '5rem' }}>
              <h2 className="section-title text-glow-gold" style={{ fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                📰 Comunicados y Novedades
              </h2>
              {news.length === 0 ? (
                <div className="glass-premium" style={{ padding: '3rem', textAlign: 'center', borderRadius: '12px', color: '#9ca3af' }}>
                  No hay noticias publicadas en este momento. ¡Vuelve pronto!
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                  {news.map(item => (
                    <article key={item.id} className="glass-premium hover-3d" style={{ borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <img src={item.cover_image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                          {new Date(item.published_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>{item.title}</h3>
                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '1.5rem', flex: 1 }}>{item.excerpt}</p>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', marginTop: 'auto' }}>
                          <button onClick={() => alert(item.content)} className="btn-secondary" style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                            Leer Más
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* FLYERS & VIDEOS */}
            {media.length > 0 && (
              <section>
                <h2 className="section-title text-glow-gold" style={{ fontSize: '1.5rem', marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  🎥 Flyers y Multimedia de Galas
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                  {media.map(m => {
                    const isVideo = m.media_type === 'video';
                    return (
                      <div key={m.id} className="glass-premium hover-3d" style={{ borderRadius: '12px', overflow: 'hidden' }}>
                        {isVideo ? (
                          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                            <iframe
                              src={m.url.replace('watch?v=', 'embed/')}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            />
                          </div>
                        ) : (
                          <div style={{ height: '350px', overflow: 'hidden' }}>
                            <img src={m.url} alt={m.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div style={{ padding: '1rem' }}>
                          <p style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{m.caption}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
