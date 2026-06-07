'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState([] as any[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) {
        console.error('Error fetching audit logs:', error);
      } else {
        setLogs(data ?? []);
      }
      setLoading(false);
    }
    fetchLogs();
  }, []);

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-emerald-300">Auditoría</h1>
      {loading ? (
        <p>Cargando registros...</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-800">
              <th className="border px-4 py-2 text-left">Fecha</th>
              <th className="border px-4 py-2 text-left">Acción</th>
              <th className="border px-4 py-2 text-left">Usuario</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-gray-700">
                <td className="border px-4 py-2">{new Date(log.created_at).toLocaleString()}</td>
                <td className="border px-4 py-2">{log.action}</td>
                <td className="border px-4 py-2">{log.user_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
