import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Cliente MP
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

// Necesitamos la service_role key de Supabase para insertar sin pasar por RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    
    // Mercado Pago envía los datos por query params o body
    const type = url.searchParams.get('type') || url.searchParams.get('topic');
    const dataId = url.searchParams.get('data.id') || url.searchParams.get('id');

    const body = await req.json().catch(() => ({}));

    const actualType = type || body?.type;
    const paymentId = dataId || body?.data?.id;

    // Solo procesamos eventos de pago
    if (actualType === 'payment' && paymentId) {
      const paymentClient = new Payment(client);
      
      // Consultar el estado real del pago para evitar fraudes (Spoofing)
      const paymentInfo = await paymentClient.get({ id: paymentId });

      if (paymentInfo.status === 'approved') {
        const metadata = paymentInfo.metadata;
        
        if (metadata && metadata.participant_id && metadata.qty) {
          
          // Registrar los votos de manera segura en la BD
          const { error } = await supabase
            .from('votes')
            .insert({
              participant_id: metadata.participant_id,
              vote_count: parseInt(metadata.qty, 10),
              payment_id: String(paymentId),
              amount: paymentInfo.transaction_amount,
              status: 'valid'
            });
            
          if (error) {
            console.error('Error insertando votos en Supabase:', error);
          } else {
            console.log(`✅ ${metadata.qty} votos registrados para participante ${metadata.participant_id}`);
          }
        }
      }
    }

    // Siempre retornar 200 OK rápido para que Mercado Pago no reintente
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
