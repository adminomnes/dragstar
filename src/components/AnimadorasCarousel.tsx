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

export default function AnimadorasCarousel() {
  const [animadoras, setAnimadoras] = useState<Animadora[]>([]);

  useEffect(() => {
    supabase
      .from('animadoras')
      .select('*')
      .eq('role', 'backstage')
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setAnimadoras(data);
        } else {
          // fallback placeholder
          setAnimadoras([
            { id: 'bs1', name: 'Luna Luz', role: 'backstage', profile_image: '/animadoras/luna.png', description: 'Animadora carismática del backstage.' },
            { id: 'bs2', name: 'María Sol', role: 'backstage', profile_image: '/animadoras/maria.png', description: 'Energía y estilo entre bastidores.' },
            { id: 'bs3', name: 'Celia Nova', role: 'backstage', profile_image: '/animadoras/celia.png', description: 'Conectando al público con los concursantes.' },
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
