'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PrizeLive() {
  const [prize, setPrize] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Initial fetch and Realtime subscription
  useEffect(() => {
    const fetchPrize = async () => {
      const { data, error } = await supabase
        .from('prize_pool')
        .select('total_clp')
        .single();
      if (!error && data) {
        setPrize(Number(data.total_clp));
      }
      setLoading(false);
    };

    fetchPrize();

    const channel = supabase
      .channel('public:prize_pool')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'prize_pool' }, (payload) => {
        setPrize(Number(payload.new.total_clp));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formattedPrize = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(prize);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <div className="section-subtitle">Premio Acumulado</div>
      <div className="prize-number animate-float" style={{ minHeight: '4.5rem' }}>
        {loading ? '---' : formattedPrize}
      </div>
      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem', letterSpacing: '0.05em' }}>
        Aumenta con cada voto en tiempo real
      </p>
    </div>
  );
}
