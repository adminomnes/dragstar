'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ParticipantCard from '@/components/ParticipantCard';
import VoteModal from '@/components/VoteModal';
import { supabase } from '@/lib/supabase';

export default function Participantes() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [isVoteModalOpen, setVoteModalOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    supabase
      .from('participants')
      .select('*')
      .order('stage_name', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setParticipants(data);
        }
      });
  }, []);

  const handleVoteClick = (id?: string, name?: string) => {
    if(id && name) {
      setSelectedParticipant({ id, name });
    } else {
      setSelectedParticipant(null);
    }
    setVoteModalOpen(true);
  };

  return (
    <>
      <Header />
      <main style={{ paddingTop: '80px', minHeight: '100vh', background: 'var(--deep-black)' }}>
        <div className="reveal glass-premium" style={{ maxWidth: 1280, margin: '0 auto', padding: '4rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="reveal">
            <h1 className="section-title text-glow-gold">Todas las Participantes</h1>
            <div className="section-divider" style={{ margin: '1.5rem auto' }} />
          </div>
          
          <div className="reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
            {participants.map(p => (
              <div key={p.id} className="hover-3d">
                <ParticipantCard 
                  participant={p} 
                  onClickVote={() => handleVoteClick(p.id, p.stage_name)} 
                />
              </div>
            ))}
            {participants.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#9ca3af', padding: '4rem 0' }}>
                Aún no hay participantes registradas.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      
      <VoteModal 
        isOpen={isVoteModalOpen} 
        onClose={() => setVoteModalOpen(false)}
        participantId={selectedParticipant?.id}
        participantName={selectedParticipant?.name}
      />
    </>
  );
}
