'use client';
import { useState, useRef, useEffect } from 'react';

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Intentar reproducir automáticamente cuando cargue, aunque a veces el navegador lo bloquea
  useEffect(() => {
    if (audioRef.current) {
      // Configuramos volumen moderado por defecto
      audioRef.current.volume = 0.4;
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log('Autoplay prevent error:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src="/la_corona_ardiente.mp3" 
        loop 
        preload="auto"
      />
      
      <button 
        onClick={togglePlay}
        className="glass-premium"
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 20px',
          borderRadius: '50px',
          border: '1px solid rgba(212,175,55,0.4)',
          background: isPlaying ? 'rgba(212,175,55,0.15)' : 'rgba(0,0,0,0.6)',
          color: '#D4AF37',
          cursor: 'pointer',
          boxShadow: isPlaying ? '0 0 15px rgba(212,175,55,0.3)' : '0 4px 10px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div 
          style={{ 
            fontSize: '1.2rem',
            animation: isPlaying ? 'spin 3s linear infinite' : 'none'
          }}
        >
          💿
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>Tema Oficial</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>La Corona Ardiente</span>
        </div>
        <div style={{ marginLeft: '10px', fontSize: '1.2rem' }}>
          {isPlaying ? '⏸' : '▶'}
        </div>
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </>
  );
}
