'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Inicio' },
    { href: '/participantes', label: 'Participantes' },
    { href: '/galas', label: 'Galas' },
    { href: '/ranking', label: 'Ranking' },
    { href: '/noticias', label: 'Noticias' },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.4s ease',
        background: scrolled
          ? 'rgba(10,5,32,0.95)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(184,115,51,0.2)' : 'none',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>

          {/* LOGO */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <img 
              src="/logo.png" 
              alt="Drag Star Antofagasta Logo" 
              style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>

          {/* NAV DESKTOP */}
          <nav style={{ display: 'flex', gap: '0.25rem' }} className="nav-desktop">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href} style={{
                padding: '0.5rem 0.875rem',
                color: '#D4904A',
                fontSize: '0.85rem',
                letterSpacing: '0.06em',
                textDecoration: 'none',
                borderRadius: 4,
                transition: 'color 0.2s ease',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
              onMouseLeave={e => (e.currentTarget.style.color = '#D4904A')}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA BUTTON */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <a href="#votar" className="btn-vote" style={{ fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}>
              ⭐ Votar Ahora
            </a>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1.5rem',
              }}
              className="hamburger-btn"
              aria-label="Menú"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div style={{
            padding: '1rem 0',
            borderTop: '1px solid rgba(212,175,55,0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  padding: '0.75rem 1rem',
                  color: '#9ca3af',
                  fontSize: '1rem',
                  textDecoration: 'none',
                  borderRadius: 4,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
