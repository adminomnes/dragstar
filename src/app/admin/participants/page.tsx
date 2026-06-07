// src/app/admin/participants/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Participant = {
  id: string;
  stage_name: string | null;
  real_name: string | null;
  city: string | null;
  status: 'active' | 'deleted' | 'finalist' | 'winner';
  photo_url: string | null;
};

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchParticipants() {
    const { data, error } = await supabase
      .from('participants')
      .select('id, stage_name, real_name, city, status, photo_url')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching participants:', error);
    } else {
      setParticipants(data as Participant[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchParticipants();
  }, []);

  async function toggleStatus(id: string, current: string) {
    const newStatus = current === 'active' ? 'deleted' : 'active';
    const { error } = await supabase
      .from('participants')
      .update({ status: newStatus })
      .eq('id', id);
    if (error) {
      alert('Error updating status');
      console.error(error);
    } else {
      // Refresh list
      fetchParticipants();
    }
  }

  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Participantes</h1>
      <div className="flex justify-end mb-4">
        <Link
          href="/admin/participants/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          + Crear participante
        </Link>
      </div>
      <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
        <thead className="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th className="px-4 py-2 text-left">Foto</th>
            <th className="px-4 py-2 text-left">Nombre artístico</th>
            <th className="px-4 py-2 text-left">Nombre real</th>
            <th className="px-4 py-2 text-left">Ciudad</th>
            <th className="px-4 py-2 text-left">Estado</th>
            <th className="px-4 py-2 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.id} className="border-t border-gray-200 dark:border-gray-600">
              <td className="px-4 py-2">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.stage_name ?? ''} className="h-12 w-12 object-cover rounded-full" />
                ) : (
                  <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-full" />
                )}
              </td>
              <td className="px-4 py-2">{p.stage_name}</td>
              <td className="px-4 py-2">{p.real_name}</td>
              <td className="px-4 py-2">{p.city}</td>
              <td className="px-4 py-2 capitalize text-{p.status === 'active' ? 'green' : p.status === 'deleted' ? 'red' : 'yellow'}-600">
                {p.status}
              </td>
              <td className="px-4 py-2 space-x-2">
                <Link
                  href={`/admin/participants/${p.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => toggleStatus(p.id, p.status)}
                  className="text-sm px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                >
                  {p.status === 'active' ? 'Desactivar' : 'Activar'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
