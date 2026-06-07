'use client';
import Image from 'next/image';

interface Animadora {
  id: string;
  name: string;
  role: 'reality' | 'backstage' | 'mirror';
  profile_image: string;
  description: string;
}

const roleLabel: Record<string, string> = {
  reality: 'Animadora del Reality',
  backstage: 'Animadora del Backstage',
  mirror: 'Animadora Detrás del Espejo',
};

export default function AnimadoraCard({ animadora }: { animadora: Animadora }) {
  return (
    <div className="card-participant group" style={{ borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%' }}>
        <Image
          src={animadora.profile_image || '/animadoras/sofia.png'}
          alt={animadora.name}
          fill
          sizes="260px"
          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          className="group-hover:scale-105"
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(13,13,26,1) 0%, rgba(13,13,26,0.4) 50%, transparent 100%)'
        }} />
        {/* Info */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.25rem', zIndex: 10 }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: '0.3rem', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
            {animadora.name}
          </h3>
          <p style={{ color: '#D4AF37', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {roleLabel[animadora.role] || animadora.role}
          </p>
        </div>
      </div>
    </div>
  );
}
