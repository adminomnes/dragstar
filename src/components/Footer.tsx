import Link from 'next/link';

const DuneDivider = () => (
  <div className="dune-divider" style={{ position: 'absolute', top: '-59px', left: 0, right: 0, zIndex: 1, pointerEvents: 'none' }}>
    <svg viewBox="0 0 1200 120" preserveAspectRatio="none" style={{ fill: 'rgba(6,3,16,0.9)' }}>
      <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
    </svg>
  </div>
);

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      background: 'rgba(6,3,16,0.9)',
      borderTop: 'none',
      paddingTop: '4rem',
      paddingBottom: '2rem',
    }}>
      <DuneDivider />
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 2 }}>
        {/* Top */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Marca */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <img 
                src="/logo.png" 
                alt="Drag Star Antofagasta Logo" 
                style={{ height: '60px', width: 'auto', objectFit: 'contain' }} 
              />
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 260 }}>
              El concurso de transformismo más glamoroso del norte de Chile. Arte, talento y espectáculo en cada gala.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              {['📸', '🎵', '📘'].map((icon, i) => (
                <a key={i} href="#" style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  border: '1px solid rgba(212,175,55,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ color: '#D4AF37', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Concurso
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {['Participantes', 'Galas Semanales', 'Ranking General', 'Premio Acumulado', 'Noticias'].map(item => (
                <Link key={item} href={`/${item.toLowerCase().replace(/ /g, '-')}`}
                  style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 style={{ color: '#D4AF37', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Contacto
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📍 Antofagasta, Chile</p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>✉️ info@dragstarantofagasta.cl</p>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>📱 +56 9 XXXX XXXX</p>
            </div>
          </div>

          {/* Votar */}
          <div>
            <h4 style={{ color: '#D4AF37', fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>
              Vota por tu Favorita
            </h4>
            <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              Cada voto cuenta. Apoya a tu artista favorita y ayuda a construir el premio final.
            </p>
            <a href="#votar" className="btn-vote" style={{ fontSize: '0.85rem', padding: '0.75rem 1.5rem' }}>
              ⭐ Votar Ahora
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="neon-line" style={{ margin: '2rem 0' }} />

        {/* Bottom */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <p style={{ color: '#374151', fontSize: '0.8rem' }}>
            © {new Date().getFullYear()} Drag Star Antofagasta. Todos los derechos reservados.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Términos', 'Privacidad', 'Admin'].map(item => (
              <Link key={item} href={item === 'Admin' ? '/admin' : '#'}
                style={{ color: '#374151', fontSize: '0.8rem', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
                onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
