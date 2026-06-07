"use client";
import "@/app/globals.css";
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#000', color: '#D4AF37', fontFamily: "'Inter', sans-serif", fontSize: '1rem' }}>
      Cargando...
    </div>
  );

  const navLinks = [
    { href: '/admin', label: '🏠 Dashboard' },
    { href: '/admin/participantes', label: '👑 Participantes' },
    { href: '/admin/animadoras', label: '🎤 Animadoras' },
    { href: '/admin/galas', label: '🎭 Galas' },
    { href: '/admin/votaciones', label: '⭐ Votaciones' },
    { href: '/admin/etapas', label: '📅 Etapas' },
    { href: '/admin/noticias', label: '📰 Noticias' },
    { href: '/admin/inscripciones', label: '📝 Inscripciones' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000', fontFamily: "'Inter', sans-serif" }}>
      {/* SIDEBAR */}
      <aside className="glass-premium" style={{
        width: '260px',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0d0d1a 0%, #1a0a2e 100%)',
        borderRight: '1px solid rgba(212,175,55,0.2)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(212,175,55,0.15)' }}>
          <img src="/logo1.png" alt="Drag Star" className="logo-premium" style={{ width: '120px', height: 'auto', filter: 'drop-shadow(0 4px 12px rgba(212,175,55,0.3))' }} />
          <p style={{ color: '#D4AF37', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: '0.5rem' }}>Panel Maestro</p>
        </div>

        {/* Navegación */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="hover-3d" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  color: isActive ? '#D4AF37' : '#9ca3af',
                  background: isActive ? 'rgba(212,175,55,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#D4AF37';
                    e.currentTarget.style.background = 'rgba(212,175,55,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = '#9ca3af';
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuario y botón salir */}
        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(212,175,55,0.15)' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.75rem', marginBottom: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.email}
          </p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/auth/signin');
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#EF4444',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="reveal" style={{
        marginLeft: '260px',
        flex: 1,
        padding: '2rem',
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0a0a0f 0%, #0d0d1a 100%)',
        color: '#fff',
      }}>
        {children}
      </main>
    </div>
  );
}
