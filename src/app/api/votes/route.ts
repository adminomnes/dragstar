import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Usamos el service_role key en el backend para poder insertar en tablas bypassando el RLS (si es necesario)
// Sin embargo, queremos registrar el voto de manera segura.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { participantId, amount } = body;

    if (!participantId || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    // 1. Verificar que las votaciones estén ABIERTAS
    const { data: settings } = await supabaseAdmin
      .from('vote_settings')
      .select('is_open')
      .eq('id', 1)
      .single();

    if (!settings?.is_open) {
      return NextResponse.json({ error: 'Las votaciones se encuentran cerradas.' }, { status: 403 });
    }

    // 2. Obtener la etapa activa
    const { data: activeStage } = await supabaseAdmin
      .from('competition_stages')
      .select('id')
      .eq('status', 'active')
      .single();

    if (!activeStage) {
      return NextResponse.json({ error: 'No hay ninguna etapa activa.' }, { status: 400 });
    }

    // 3. Registrar el voto (En este ejemplo asumimos que ya pasó por pago y es exitoso)
    // Para la integración real de pagos, esto ocurriría en el webhook del proveedor (MercadoPago/Flow).
    const { data: vote, error: voteError } = await supabaseAdmin
      .from('votes')
      .insert({
        participant_id: participantId,
        stage_id: activeStage.id,
        amount: amount,
        payment_status: 'completed' // En un flujo sin pago simulamos success
      })
      .select()
      .single();

    if (voteError) throw voteError;

    // 4. Registrar en Auditoría de Votos (vote_logs)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    await supabaseAdmin.from('vote_logs').insert({
      vote_id: vote.id,
      action: 'VOTE_REGISTERED',
      details: { amount },
      ip_address: ip
    });

    return NextResponse.json({ success: true, vote });
    
  } catch (error: any) {
    console.error('API /votes error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
