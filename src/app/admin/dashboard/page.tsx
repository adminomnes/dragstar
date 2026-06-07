'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    isOpen: false,
    activeStage: 'Cargando...',
    totalParticipants: 0,
    totalVotes: 0,
  });

  useEffect(() => {
    async function loadStats() {
      // 1. Votación abierta
      const { data: voteSettings } = await supabase.from('vote_settings').select('is_open').eq('id', 1).single();
      
      // 2. Etapa activa
      const { data: stage } = await supabase.from('competition_stages').select('name').eq('status', 'active').single();
      
      // 3. Total participantes activas
      const { count: participantsCount } = await supabase.from('participants').select('id', { count: 'exact', head: true }).eq('status', 'active');
      
      // 4. Total Votos (para la etapa actual o general)
      const { data: ranking } = await supabase.from('general_rankings').select('total_votes');
      const totalVotos = ranking?.reduce((acc, curr) => acc + Number(curr.total_votes), 0) || 0;

      setStats({
        isOpen: voteSettings?.is_open || false,
        activeStage: stage?.name || 'Ninguna',
        totalParticipants: participantsCount || 0,
        totalVotes: totalVotos,
      });
    }
    
    loadStats();
  }, []);

  return (
    <div>
      <h1 className="section-title reveal" style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '2rem' }}>Dashboard</h1>
      
      <div className="glass-premium reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        
        {/* Card 1 */}
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Estado Votación</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: stats.isOpen ? '#10b981' : '#ef4444' }} />
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.isOpen ? 'ABIERTAS' : 'CERRADAS'}</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Etapa Actual</p>
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#D4AF37' }}>{stats.activeStage}</span>
        </div>

        {/* Card 3 */}
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Votos</p>
          <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FF1493' }}>{stats.totalVotes.toLocaleString('es-CL')}</span>
        </div>

        {/* Card 4 */}
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Participantes Activas</p>
          <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalParticipants}</span>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px' }}>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#D4AF37' }}>Top 5 Semanal</h3>
           <p style={{ color: '#9ca3af' }}>Aquí se cargará el Top 5 desde Supabase...</p>
        </div>
        
        <div className="glass-premium hover-3d" style={{ background: '#1a1a24', padding: '1.5rem', borderRadius: '12px' }}>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Últimas Acciones</h3>
           <p style={{ color: '#9ca3af' }}>Aquí se cargarán los logs de auditoría recientes...</p>
        </div>
      </div>
    </div>
  );
}
