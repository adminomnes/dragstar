'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';

export default function RankingPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'semanal'>('general');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRankings = async () => {
    if (activeTab === 'general') {
      const { data } = await supabase.from('general_rankings').select('*').order('position', { ascending: true });
      if (data) setRankings(data);
    } else {
      const { data: stage } = await supabase.from('competition_stages').select('id, name').eq('status', 'active').single();
      if (stage) {
        const { data } = await supabase
          .from('weekly_rankings')
          .select('*, participants(stage_name, profile_image, city)')
          .eq('stage_id', stage.id)
          .order('position', { ascending: true });
        if (data) setRankings(data);
      } else {
        setRankings([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchRankings();

    // Suscripción a cambios
    const channel = supabase.channel('rankings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weekly_rankings' }, () => {
        fetchRankings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTab]);

  return (
    <>
      <Header />
      <main style={{ paddingTop: '100px', minHeight: '80vh' }}>
        <div className="reveal glass-premium" style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 className="section-title text-glow-gold">Ranking Oficial</h1>
            <p style={{ color: '#9ca3af', marginTop: '1rem' }}>Sigue en tiempo real las posiciones de nuestras estrellas.</p>
          </div>

          {/* TABS */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
            <button 
              onClick={() => setActiveTab('general')}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                border: '1px solid #D4AF37',
                background: activeTab === 'general' ? '#D4AF37' : 'transparent',
                color: activeTab === 'general' ? '#000' : '#D4AF37',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              General
            </button>
            <button 
              onClick={() => setActiveTab('semanal')}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: '30px',
                border: '1px solid #D4AF37',
                background: activeTab === 'semanal' ? '#D4AF37' : 'transparent',
                color: activeTab === 'semanal' ? '#000' : '#D4AF37',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            >
              Semanal
            </button>
          </div>

          {/* LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>Cargando ranking...</div>
            ) : rankings.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', padding: '3rem' }}>No hay datos para mostrar en esta categoría.</div>
            ) : (
              rankings.map((r, index) => {
                const isGeneral = activeTab === 'general';
                const name = isGeneral ? r.stage_name : r.participants.stage_name;
                const city = isGeneral ? r.city : r.participants.city;
                const votes = r.total_votes;
                const isFavorite = r.is_favorite;

                return (
                  <div key={r.id || r.participant_id} className={`rank-row top-${index + 1}`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: index === 0 ? '#D4AF37' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#9ca3af', textAlign: 'center', minWidth: '40px' }}>
                      #{index + 1}
                    </div>
                    
                    <div style={{ flex: 1, paddingLeft: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700 }}>{name}</div>
                        {isFavorite && <span style={{ fontSize: '0.7rem', background: '#FF1493', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>FAVORITA</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{city}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FF1493' }}>{Number(votes).toLocaleString('es-CL')}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Votos</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
