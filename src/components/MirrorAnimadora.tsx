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

export default function MirrorAnimadora() {
  const [animadora, setAnimadora] = useState<Animadora | null>(null);

  useEffect(() => {
    supabase
      .from('animadoras')
      .select('*')
      .eq('role', 'mirror')
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setAnimadora(data);
        } else {
          setAnimadora({ id: 'mirror1', name: 'Estela Espejo', role: 'mirror', profile_image: '/animadoras/sofia.png', description: 'Animadora misteriosa detrás del espejo.' });
        }
      });
  }, []);

  if (!animadora) return null;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
        <div className="hover-3d">
          <AnimadoraCard animadora={animadora} />
        </div>
      </div>
    </div>
  );
}
