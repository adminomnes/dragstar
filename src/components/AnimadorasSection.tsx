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

const fallback: Animadora[] = [
  { id: 're1', name: 'Sofía Estrella', role: 'reality', profile_image: '/animadoras/sofia.png', description: '' },
  { id: 'bs1', name: 'Luna Luz', role: 'backstage', profile_image: '/animadoras/luna.png', description: '' },
  { id: 'bs2', name: 'María Sol', role: 'backstage', profile_image: '/animadoras/maria.png', description: '' },
  { id: 'mirror1', name: 'Estela Espejo', role: 'mirror', profile_image: '/animadoras/sofia.png', description: '' },
];

export default function AnimadorasSection() {
  const [animadoras, setAnimadoras] = useState<Animadora[]>([]);

  useEffect(() => {
    supabase
      .from('animadoras')
      .select('*')
      .order('role')
      .order('name')
      .then(({ data }) => {
        setAnimadoras(data && data.length > 0 ? data : fallback);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {animadoras.map((anim) => (
          <div key={anim.id} className="hover-3d" style={{ flex: '0 0 260px', maxWidth: '260px' }}>
            <AnimadoraCard animadora={anim} />
          </div>
        ))}
      </div>
    </div>
  );
}
