'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMsg(`Error: ${error.message}`);
      } else {
        router.replace('/admin');
      }
    } catch (err) {
      setMsg('No se pudo conectar con el servidor. Verifica que Supabase esté configurado correctamente en .env.local');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #1a0a2e 0%, #0a0a0f 50%, #000 100%)',
      padding: '1rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Efecto de partículas decorativas */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${2 + i}px`,
            height: `${2 + i}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#D4AF37' : '#FF1493',
            top: `${15 + i * 14}%`,
            left: `${10 + i * 15}%`,
            opacity: 0.3,
            animation: `twinkle ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
      </div>

      <div style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '440px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img
            src="/logo1.png"
            alt="Drag Star Antofagasta"
            style={{
              width: '180px',
              height: 'auto',
              margin: '0 auto',
              filter: 'drop-shadow(0 4px 20px rgba(212,175,55,0.4))',
            }}
          />
        </div>

        {/* Tarjeta de login */}
        <form
          onSubmit={handleSubmit}
          style={{
            background: 'linear-gradient(145deg, rgba(13,13,26,0.95) 0%, rgba(26,10,46,0.9) 100%)',
            border: '1px solid rgba(212,175,55,0.25)',
            borderRadius: '16px',
            padding: '2.5rem',
            boxShadow: '0 30px 80px rgba(123,44,191,0.25), 0 0 0 1px rgba(212,175,55,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Título */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.75rem',
            fontWeight: 900,
            textAlign: 'center',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #D4AF37, #F0C93A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Panel Administrativo
          </h1>
          <p style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '0.85rem',
            marginBottom: '2rem',
            letterSpacing: '0.05em',
          }}>
            Inicia sesión para continuar
          </p>

          {/* Divider decorativo */}
          <div style={{
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)',
            margin: '0 auto 2rem',
          }} />

          {/* Campo Correo */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#D4AF37',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@correo.cl"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Campo Contraseña */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#D4AF37',
              marginBottom: '0.5rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(212,175,55,0.2)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.95rem',
                fontFamily: "'Inter', sans-serif",
                outline: 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Botón Entrar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: loading
                ? 'rgba(212,175,55,0.3)'
                : 'linear-gradient(135deg, #7B2CBF, #FF1493)',
              color: '#fff',
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: '0.08em',
              borderRadius: '8px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 30px rgba(123,44,191,0.4)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(255,20,147,0.5)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 30px rgba(123,44,191,0.4)';
            }}
          >
            {loading ? '⏳ Ingresando…' : '✨ Entrar'}
          </button>

          {/* Mensaje de error/estado */}
          {msg && (
            <p style={{
              marginTop: '1.25rem',
              textAlign: 'center',
              fontSize: '0.85rem',
              color: msg.startsWith('Error') ? '#EF4444' : '#D4AF37',
              padding: '0.75rem',
              background: msg.startsWith('Error')
                ? 'rgba(239,68,68,0.1)'
                : 'rgba(212,175,55,0.1)',
              borderRadius: '8px',
              border: `1px solid ${msg.startsWith('Error')
                ? 'rgba(239,68,68,0.3)'
                : 'rgba(212,175,55,0.3)'}`,
            }}>
              {msg}
            </p>
          )}
        </form>

        {/* Enlace de regreso */}
        <p style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          fontSize: '0.8rem',
          color: '#6b7280',
        }}>
          <a
            href="/"
            style={{
              color: '#FF1493',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#D4AF37'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#FF1493'}
          >
            ← Volver al sitio
          </a>
        </p>
      </div>
    </main>
  );
}
