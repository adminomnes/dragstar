import Image from 'next/image';

interface Participant {
  id: string;
  stage_name: string;
  city: string;
  profile_image: string;
  status: 'active' | 'eliminated' | 'finalist' | 'winner';
  is_featured?: boolean;
}

interface ParticipantCardProps {
  participant: Participant;
  onClickVote: () => void;
}

export default function ParticipantCard({ participant, onClickVote }: ParticipantCardProps) {
  
  const statusConfig = {
    active:     { label: 'En Competencia', class: 'badge-active' },
    eliminated: { label: 'Eliminada', class: 'badge-eliminated' },
    finalist:   { label: 'Finalista', class: 'badge-finalist' },
    winner:     { label: 'Ganadora', class: 'badge-winner' },
  };

  const status = statusConfig[participant.status] || statusConfig.active;

  return (
    <div className="card-participant group">
      <div style={{ position: 'relative', aspectRatio: '3/4', width: '100%' }}>
        {/* Usamos div normal con background image para demo si no hay next/image configurado,
            pero en prod se usa next/image con placeholder de Supabase Storage */}
        <div 
          style={{ 
            position: 'absolute', 
            inset: 0, 
            backgroundImage: `url(${participant.profile_image || 'https://images.unsplash.com/photo-1574512964344-912f2ea29b8c?w=500&q=80'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'transform 0.5s ease',
            filter: participant.status === 'eliminated' ? 'grayscale(100%) opacity(0.7)' : 'none'
          }} 
          className="group-hover:scale-105"
        />
        
        {/* Gradient Overlay bottom to top */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          background: 'linear-gradient(to top, rgba(13,13,26,1) 0%, rgba(13,13,26,0.6) 40%, transparent 100%)' 
        }} />

        {/* Hover Action Overlay */}
        <div className="card-overlay" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          {participant.status !== 'eliminated' ? (
            <button 
              className="btn-vote btn-reality btn-reality-gold" 
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              onClick={(e) => {
                e.stopPropagation();
                onClickVote();
              }}
            >
              ⭐ VOTAR
            </button>
          ) : (
            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '4px' }}>
              ❌ Eliminada
            </span>
          )}
          <span style={{ color: '#fff', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }}>
            Ver Perfil
          </span>
        </div>

        {/* Badges */}
        <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span className={`badge ${status.class}`}>{status.label}</span>
          {participant.is_featured && (
             <span className="badge badge-public">⭐ Favorita</span>
          )}
        </div>

        {/* Info Inferior */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', zIndex: 10 }}>
          <h3 style={{ 
            fontFamily: "'Playfair Display', serif", 
            fontSize: '1.5rem', 
            fontWeight: 700, 
            color: '#fff',
            marginBottom: '0.25rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}>
            {participant.stage_name}
          </h3>
          <p style={{ color: '#D4AF37', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {participant.city}
          </p>
        </div>
      </div>
    </div>
  );
}
