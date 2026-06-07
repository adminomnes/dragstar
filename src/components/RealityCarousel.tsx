'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AnimadoraCard from '@/components/AnimadoraCard';

interface Animadora {
  id: string;
  name: string;
  role: 'reality' | 'backstage' | 'mirror';
  profile_image: string;
  description: string;
}

export default function RealityCarousel() {
  const [animadoras, setAnimadoras] = useState<Animadora[]>([]);

  useEffect(() => {
    supabase
      .from('animadoras')
      .select('*')
      .eq('role', 'reality')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAnimadoras(data);
        } else {
          // fallback placeholder
          setAnimadoras([
            { id: 're1', name: 'Sofía Estrella', role: 'reality', profile_image: '/animadoras/sofia.png', description: 'Animadora principal del reality.' },
            { id: 're2', name: 'Lola Brillo', role: 'reality', profile_image: '/animadoras/lola.png', description: 'Energía y glamour en el escenario.' },
          ]);
        }
      });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
        {animadoras.map((anim) => (
          <div key={anim.id} className="hover-3d">
            <AnimadoraCard animadora={anim} />
          </div>
        ))}
      </div>
    </div>
  );
}
