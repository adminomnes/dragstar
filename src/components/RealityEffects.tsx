'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RealityEffects() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Array<{ id: number; left: string; delay: string; duration: string }>>([]);
  const pathname = usePathname();

  // Inicializar partículas y cursor (solo una vez)
  useEffect(() => {
    // Generar partículas aleatorias para el fondo
    const newParticles = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 20}s`,
    }));
    setParticles(newParticles);

    // Seguimiento del mouse para el cursor personalizado
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Observador de Scroll (se vuelve a ejecutar cada vez que cambia la ruta para observar nuevos elementos)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal, .scale-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <>
      {/* Partículas de Fondo */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map(p => (
          <div
            key={p.id}
            style={{
              position: 'absolute',
              bottom: '-20px',
              left: p.left,
              width: '4px',
              height: '4px',
              background: 'rgba(212,175,55,0.6)',
              borderRadius: '50%',
              boxShadow: '0 0 10px rgba(212,175,55,0.8)',
              animation: `floatingParticle ${p.duration} linear infinite`,
              animationDelay: p.delay,
            }}
          />
        ))}
        {/* Luces de Escenario (Spotlights) sutiles */}
        <div style={{
          position: 'absolute', top: 0, left: '-50%', width: '200%', height: '100%',
          background: 'radial-gradient(circle at 30% 0%, rgba(255,20,147,0.03) 0%, transparent 50%), radial-gradient(circle at 70% 0%, rgba(123,44,191,0.03) 0%, transparent 50%)',
          animation: 'spotlightSweep 15s ease-in-out infinite alternate',
        }} />
      </div>

      {/* Cursor Personalizado (Glamoroso) */}
      <div style={{
        position: 'fixed',
        top: mousePos.y,
        left: mousePos.x,
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        border: '2px solid rgba(212,175,55,0.8)',
        background: 'rgba(255,20,147,0.2)',
        boxShadow: '0 0 15px rgba(212,175,55,0.6)',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        transition: 'width 0.2s, height 0.2s',
        backdropFilter: 'blur(2px)',
      }} className="reality-cursor" />
      <div style={{
        position: 'fixed',
        top: mousePos.y,
        left: mousePos.x,
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#fff',
        boxShadow: '0 0 10px #fff',
        pointerEvents: 'none',
        transform: 'translate(-50%, -50%)',
        zIndex: 10000,
      }} />
    </>
  );
}
