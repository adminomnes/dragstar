'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import AnimadorasSection from '@/components/AnimadorasSection';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import ParticipantCard from '@/components/ParticipantCard';
import VoteModal from '@/components/VoteModal';
import RegistrationModal from '@/components/RegistrationModal';
import { supabase } from '@/lib/supabase';

const DuneDivider = () => (
  <div className="dune-divider" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1, pointerEvents: 'none' }}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ fill: 'rgba(184,115,51,0.08)' }}>
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
    </svg>
  </div>
);

export default function Home() {
  const [isVoteModalOpen, setVoteModalOpen] = useState(false);
  const [isRegistrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{ id: string; name: string } | null>(null);
  const [proximaGala, setProximaGala] = useState<{ name: string; date: string; time: string; image_url?: string } | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);

  // Detectar si venimos de un pago exitoso
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('payment_status');
      const qty = urlParams.get('qty');
      const participant = urlParams.get('participant');
      
      if (status === 'success') {
        alert(`¡Gracias por tu apoyo! ✨ Se han procesado ${qty || 'tus'} votos para ${participant || 'tu favorita'} correctamente.`);
        // Limpiar la URL para que no vuelva a salir la alerta si recarga
        window.history.replaceState({}, '', '/');
      }
    }
  }, []);

  // Fetchear la próxima gala desde Supabase
  useEffect(() => {
    supabase
      .from('etapas')
      .select('numero, nombre, fecha, hora, image_url')
      .in('status', ['active', 'upcoming'])
      .not('fecha', 'is', null)
      .order('status', { ascending: true }) // 'active' viene antes que 'upcoming' alfabéticamente
      .order('orden', { ascending: true })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setProximaGala({ name: data.nombre, date: data.fecha, time: data.hora, image_url: data.image_url });
      });
  }, []);


  // Fetchear participantes reales de la BD
  useEffect(() => {
    supabase
      .from('participants')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setParticipants(data);
        } else {
          // Fallback temporal si la tabla está vacía para que la página no se vea rota
          setParticipants([
            { id: 'demo1', stage_name: 'Electra Shock', city: 'Antofagasta', profile_image: 'https://images.unsplash.com/photo-1563240619-44cebfc8ca8a?w=500&q=80', status: 'active' },
            { id: 'demo2', stage_name: 'Venus D\'Lite', city: 'Calama', profile_image: 'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=500&q=80', status: 'active' },
          ]);
        }
      });
  }, []);

  const handleVoteClick = (id?: string, name?: string) => {
    if(id && name) {
      setSelectedParticipant({ id, name });
    } else {
      setSelectedParticipant(null);
    }
    setVoteModalOpen(true);
  };

  return (
    <>
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section style={{ position: 'relative', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '72px', paddingBottom: '4rem', overflow: 'hidden' }}>
          {/* Background Image */}
          <div 
            className="hero-video-bg" 
            style={{ 
              backgroundImage: 'url("/hero-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              opacity: 0.35,
              filter: 'saturate(1.3) contrast(1.1)'
            }}
          />
          <div className="hero-overlay" />
          
          <div style={{ position: 'relative', zIndex: 10, maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            
            <div className="animate-float" style={{ marginBottom: '1rem' }}>
               <span style={{ color: '#D4AF37', letterSpacing: '0.3em', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Temporada 1 • Antofagasta</span>
            </div>

            <div className="animate-float animate-delay-1" style={{ marginBottom: '2rem' }}>
              <div className="flex justify-center bg-white rounded-lg p-2 shadow-md">
                <img 
                  src="/logo1.png" 
                  alt="Drag Star Antofagasta Logo" 
                  style={{ 
                    width: 'auto', 
                    maxWidth: '100%', 
                    height: 'auto', 
                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.8))'
                  }} 
                />
              </div>
            </div>

            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 'clamp(2rem, 5vw, 4rem)', 
              fontWeight: 900, 
              lineHeight: 1.1,
              marginBottom: '1.5rem',
              textShadow: '0 10px 30px rgba(0,0,0,0.8)'
            }} className="animate-float animate-delay-2">
              <span className="shimmer-text">El Glamour</span><br/>
              Tiene Nueva Reina
            </h1>
            
            <p style={{ color: '#d1d5db', fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: 600, marginBottom: '3rem', lineHeight: 1.6 }} className="animate-float animate-delay-2">
              Acompaña a las mejores artistas del norte de Chile en una competencia de talento, moda y espectáculo.
            </p>

            <div className="animate-float animate-delay-3 reveal" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                className="btn-primary animate-pulse-slow" 
                onClick={() => {
                  document.getElementById('participantes')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{
                  background: 'linear-gradient(135deg, #D4AF37 0%, #F0C93A 50%, #B49020 100%)',
                  color: '#000',
                  fontWeight: 800,
                  padding: '1rem 2.5rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  border: 'none',
                  boxShadow: '0 0 20px rgba(212,175,55,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                Conoce a las Reinas
              </button>
              
              <button 
                className="btn-secondary" 
                onClick={() => setRegistrationModalOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontWeight: 800,
                  padding: '1rem 2.5rem',
                  borderRadius: '50px',
                  fontSize: '1.1rem',
                  border: '2px solid rgba(212,175,55,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                👑 Inscríbete
              </button>
            </div>

            <div className="animate-float animate-delay-4 reveal" style={{ marginTop: '5rem', width: '100%', maxWidth: proximaGala?.image_url ? 900 : 800 }}>
              <div className="glass-premium" style={{ padding: '2rem', borderRadius: 16, display: 'flex', flexDirection: proximaGala?.image_url ? 'row' : 'column', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {proximaGala?.image_url && (
                  <div style={{ flex: '1 1 300px', maxWidth: '400px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
                    <img src={proximaGala.image_url} alt={`Flyer Gala: ${proximaGala.name}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
                
                <div style={{ flex: '2 1 400px', textAlign: 'center' }}>
                  <h3 style={{ color: '#D4AF37', fontSize: '0.85rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>
                    {proximaGala ? `Próxima Gala: ${proximaGala.name}` : 'Próxima Etapa: Glamour'}
                  </h3>
                  <Countdown targetDate={proximaGala ? `${proximaGala.date}T${proximaGala.time}` : '2026-09-27T21:00:00'} />
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* FEATURED PARTICIPANTS */}
        <section id="participantes" style={{ padding: '8rem 0 6rem', background: 'rgba(10,5,32,0.4)', position: 'relative' }}>
          <DuneDivider />
          <div className="neon-line" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />
          
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
            <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="section-subtitle">Conoce a las</div>
              <h2 className="section-title text-glow-gold">Reinas en Competencia</h2>
              <div className="section-divider" style={{ margin: '1.5rem auto' }} />
            </div>

            <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
              {participants.map(p => (
                <div key={p.id} className="hover-3d">
                  <ParticipantCard 
                    participant={p} 
                    onClickVote={() => handleVoteClick(p.id, p.stage_name)} 
                  />
                </div>
              ))}
            </div>
            
            <div className="reveal" style={{ textAlign: 'center', marginTop: '4rem' }}>
              <Link href="/participantes" className="btn-secondary btn-reality">
                Ver Todas las Participantes
              </Link>
            </div>
          </div>
        </section>

{/* ANIMADORAS */}
<section id="animadoras" style={{ padding: '8rem 0 6rem', background: 'rgba(6,3,16,0.6)', color: '#fff', position: 'relative' }}>
  <DuneDivider />
  <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
    <div className="section-subtitle">El Equipo</div>
    <h2 className="section-title text-glow-gold">Nuestras Animadoras</h2>
    <div className="section-divider" style={{ margin: '1.5rem auto' }} />
  </div>
  <AnimadorasSection />
</section>

        {/* RANKING TEASER */}
        <section className="reveal" style={{ padding: '8rem 0 6rem', background: 'linear-gradient(180deg, rgba(13,8,32,0.5) 0%, rgba(6,3,16,0.8) 100%)', position: 'relative' }}>
          <DuneDivider />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'rgba(184,115,51,0.2)' }} />
          <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
              <div className="section-subtitle">Tiempo Real</div>
              <h2 className="section-title text-glow-gold">Top 3 Ranking</h2>
              <div className="section-divider" style={{ margin: '1.5rem auto' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Dummy Ranking Rows */}
              {[
                { pos: 1, name: 'Electra Shock', votes: 15420, city: 'Antofagasta' },
                { pos: 2, name: 'Gia Metric', votes: 14890, city: 'Tocopilla' },
                { pos: 3, name: 'Krystal Versace', votes: 12300, city: 'Mejillones' }
              ].map(r => (
                <div key={r.pos} className={`rank-row hover-3d glass-premium top-3-glow-${r.pos} reveal`} style={{ transitionDelay: `${r.pos * 100}ms` }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: r.pos === 1 ? '#D4AF37' : r.pos === 2 ? '#C0C0C0' : '#CD7F32', textAlign: 'center' }}>
                    #{r.pos}
                  </div>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#333', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.2)' }}>
                     <img src={`https://i.pravatar.cc/150?u=${r.name}`} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700 }}>{r.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{r.city}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FF1493' }}>{r.votes.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>Votos</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal" style={{ textAlign: 'center', marginTop: '3rem' }}>
              <Link href="/ranking" className="btn-primary btn-reality">
                Ver Ranking Completo
              </Link>
            </div>
          </div>
        </section>


      </main>

      <Footer />

      <VoteModal 
        isOpen={isVoteModalOpen} 
        onClose={() => setVoteModalOpen(false)}
        participantId={selectedParticipant?.id}
        participantName={selectedParticipant?.name}
      />

      <RegistrationModal 
        isOpen={isRegistrationModalOpen} 
        onClose={() => setRegistrationModalOpen(false)} 
      />
    </>
  );
}
