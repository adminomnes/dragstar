'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Participantes() {
  const demoParticipants = [
    { id: '1', stage_name: 'Electra Shock', city: 'Antofagasta', profile_image: 'https://images.unsplash.com/photo-1563240619-44cebfc8ca8a?w=500&q=80', status: 'active', is_featured: true },
    { id: '2', stage_name: 'Venus D\'Lite', city: 'Calama', profile_image: 'https://images.unsplash.com/photo-1616091216791-a5360b5fc78a?w=500&q=80', status: 'active' },
    { id: '3', stage_name: 'Gia Metric', city: 'Tocopilla', profile_image: 'https://images.unsplash.com/photo-1574512964344-912f2ea29b8c?w=500&q=80', status: 'active' },
    { id: '4', stage_name: 'Krystal Versace', city: 'Mejillones', profile_image: 'https://images.unsplash.com/photo-1634621183204-e366eecba5df?w=500&q=80', status: 'active' },
    { id: '5', stage_name: 'Luna Eclipse', city: 'San Pedro', profile_image: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&q=80', status: 'eliminated' },
    { id: '6', stage_name: 'Divine', city: 'Antofagasta', profile_image: 'https://images.unsplash.com/photo-1520113110222-261ef90c9b0e?w=500&q=80', status: 'eliminated' },
  ];

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--deep-black)' }}>
        <div className="reveal glass-premium" style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="reveal">
            <h1 className="section-title text-glow-gold">Todas las Participantes</h1>
            <div className="section-divider" style={{ margin: '1.5rem auto' }} />
          </div>
          
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {/* Aquí irían las tarjetas reutilizando el componente ParticipantCard */}
            {demoParticipants.map(p => (
              <div key={p.id} className="card-participant group hover-3d" style={{ position: 'relative', aspectRatio: '3/4', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    backgroundImage: `url(${p.profile_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transition: 'transform 0.5s ease'
                  }} 
                  className="group-hover:scale-105"
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,1) 0%, rgba(13,13,26,0.6) 40%, transparent 100%)' }} />
                
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', zIndex: 10 }}>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                    {p.stage_name}
                  </h3>
                  <p style={{ color: '#D4AF37', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {p.city}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
