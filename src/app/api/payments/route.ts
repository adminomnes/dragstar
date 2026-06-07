import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { participantId, participantName, packageId, qty, price } = body;
    
    // Validar datos básicos
    if (!participantId || !packageId || !price || !qty) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN === '') {
      return NextResponse.json({ 
        error: 'El sistema de pagos aún no está activado por la administración. Pronto estará disponible.' 
      }, { status: 503 });
    }

    const preference = new Preference(client);

    const preferencePayload: any = {
      body: {
        items: [
          {
            id: `voto_${packageId}`,
            title: `Paquete de ${qty} votos para ${participantName || 'Drag Star'}`,
            quantity: 1,
            unit_price: Number(price),
            currency_id: 'CLP',
          }
        ],
        // Esto es CLAVE: aquí guardamos información que necesitamos cuando nos llegue el Webhook
        metadata: {
          participant_id: participantId,
          package_id: packageId,
          qty: qty
        }
      }
    };

    // Mercado Pago exige que las back_urls sean HTTPS y dominios públicos válidos.
    // En localhost fallará si las enviamos, así que solo las agregamos en producción.
    if (!baseUrl.includes('localhost')) {
      preferencePayload.body.back_urls = {
        success: `${baseUrl}/?payment_status=success`,
        failure: `${baseUrl}/?payment_status=failure`,
        pending: `${baseUrl}/?payment_status=pending`
      };
      preferencePayload.body.auto_return = 'approved';
    }

    const response = await preference.create(preferencePayload);

    return NextResponse.json({ 
      success: true, 
      paymentUrl: response.init_point // URL a la que redirigimos al usuario para pagar
    });
    
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json({ error: 'Error procesando el pago', details: error.message }, { status: 500 });
  }
}
