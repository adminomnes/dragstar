'use client';

interface VoteModalProps {
  participantId?: string;
  participantName?: string;
  isOpen: boolean;
  onClose: () => void;
}

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function VoteModal({ participantId, participantName, isOpen, onClose }: VoteModalProps) {
  const [isVotingOpen, setIsVotingOpen] = useState(true);
  const [loadingPkg, setLoadingPkg] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Validar estado al abrir
    const checkStatus = async () => {
      const { data } = await supabase.from('vote_settings').select('is_open').eq('id', 1).single();
      if (data) setIsVotingOpen(data.is_open);
    };
    checkStatus();

    // Escuchar cambios en tiempo real
    const channel = supabase
      .channel('public:vote_settings')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'vote_settings', filter: 'id=eq.1' }, (payload) => {
        setIsVotingOpen(payload.new.is_open);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const votePackages = [
    { qty: 10, price: 1000 },
    { qty: 20, price: 2000, popular: true },
    { qty: 50, price: 5000 },
    { qty: 100, price: 10000, bestValue: true },
  ];

  const handlePayment = async (pkg: {qty: number, price: number}) => {
    try {
      setLoadingPkg(pkg.qty);
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: participantId || 'demo_123',
          participantName: participantName || 'Drag Star',
          packageId: pkg.qty, 
          qty: pkg.qty,
          price: pkg.price
        })
      });

      const data = await res.json();
      
      if (data.paymentUrl) {
        // Redirigir al usuario al Checkout Pro de Mercado Pago
        window.location.href = data.paymentUrl;
      } else {
        alert('Error al iniciar el pago: ' + (data.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al conectar con el servidor.');
    } finally {
      setLoadingPkg(null);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1.5rem', background: 'none', border: 'none', color: '#9ca3af', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          ✕
        </button>

        <h3 className="section-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'center' }}>
          Vota por tu Favorita
        </h3>
        {participantName && (
          <p style={{ textAlign: 'center', color: '#D4AF37', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {participantName}
          </p>
        )}
        {!isVotingOpen ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'rgba(255,20,147,0.1)', borderRadius: '8px', border: '1px solid rgba(255,20,147,0.3)', marginBottom: '1rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔒</span>
            <h4 style={{ color: '#FF1493', fontSize: '1.25rem', fontWeight: 'bold' }}>VOTACIONES CERRADAS</h4>
            <p style={{ color: '#fff', marginTop: '0.5rem' }}>Las votaciones se encuentran cerradas en este momento.</p>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Apoya a tu participante. Selecciona un paquete de votos:
            </p>

            <div style={{ display: 'grid', gap: '1rem' }}>
              {votePackages.map((pkg) => (
                <button
                  key={pkg.qty}
                  onClick={() => handlePayment(pkg)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                background: pkg.popular ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${pkg.popular ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = pkg.popular ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {pkg.popular && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: '#D4AF37', color: '#000', fontSize: '0.65rem', padding: '0.1rem 0.5rem', fontWeight: 'bold', borderBottomLeftRadius: '4px' }}>
                  POPULAR
                </span>
              )}
              {pkg.bestValue && (
                <span style={{ position: 'absolute', top: 0, right: 0, background: '#FF1493', color: '#fff', fontSize: '0.65rem', padding: '0.1rem 0.5rem', fontWeight: 'bold', borderBottomLeftRadius: '4px' }}>
                  MEJOR VALOR
                </span>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>⭐</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>
                  {pkg.qty} <span style={{ fontSize: '0.9rem', color: '#9ca3af', fontFamily: "'Inter', sans-serif", fontWeight: 400 }}>votos</span>
                </span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#D4AF37' }}>
                {loadingPkg === pkg.qty ? 'Cargando...' : `$${pkg.price.toLocaleString('es-CL')}`}
              </span>
            </button>
          ))}
        </div>

            <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.75rem', color: '#6b7280' }}>
              <p>Pago seguro a través de Webpay / Flow / MercadoPago.</p>
              <p style={{ marginTop: '0.25rem' }}>Los votos se reflejarán automáticamente en el ranking.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
