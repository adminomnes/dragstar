// src/app/api/galas/route.ts
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Gala = {
  id?: string;
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status?: 'scheduled' | 'completed' | 'cancelled';
};

export async function GET(request: Request) {
  const { data, error } = await supabase.from('galas').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body: Gala = await request.json();
  const { data, error } = await supabase.from('galas').insert([body]);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}

export async function PUT(request: Request) {
  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabase.from('galas').update(updates).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { data, error } = await supabase.from('galas').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
