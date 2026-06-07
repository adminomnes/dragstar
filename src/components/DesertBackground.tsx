'use client';
import { useEffect, useRef } from 'react';

export default function DesertBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Partículas de estrellas
    const stars: { x: number; y: number; radius: number; alpha: number; speed: number }[] = [];
    // Partículas de arena
    const sand: { x: number; y: number; radius: number; alpha: number; speedY: number; speedX: number; color: string }[] = [];

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      stars.length = 0;
      sand.length = 0;

      // Crear estrellas (cielo superior)
      const numStars = Math.floor((width * height) / 10000);
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height * 0.7, // Concentradas en el 70% superior
          radius: Math.random() * 1.5,
          alpha: Math.random(),
          speed: (Math.random() - 0.5) * 0.02,
        });
      }

      // Crear partículas de arena (flotando desde abajo)
      const numSand = Math.floor(width / 30);
      const sandColors = ['#D4AF37', '#B87333', '#C19A6B']; // Oro, Cobre, Arena
      for (let i = 0; i < numSand; i++) {
        sand.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
          speedY: -(Math.random() * 1 + 0.5), // Sube
          speedX: (Math.random() - 0.5) * 1, // Deriva lateral
          color: sandColors[Math.floor(Math.random() * sandColors.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Dibujar estrellas
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 237, 232, ${star.alpha})`; // star-white
        ctx.fill();

        // Animar parpadeo
        star.alpha += star.speed;
        if (star.alpha <= 0.1 || star.alpha >= 0.8) {
          star.speed = -star.speed;
        }
      });

      // Dibujar arena
      sand.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Animar movimiento
        particle.y += particle.speedY;
        particle.x += particle.speedX;

        // Resetear si sale de la pantalla
        if (particle.y < 0) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }
        if (particle.x > width + 10) particle.x = -10;
        if (particle.x < -10) particle.x = width + 10;
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();

    window.addEventListener('resize', init);

    return () => {
      window.removeEventListener('resize', init);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1, // Detrás de todo
        pointerEvents: 'none', // No interfiere con clics
        background: 'transparent',
      }}
    />
  );
}
