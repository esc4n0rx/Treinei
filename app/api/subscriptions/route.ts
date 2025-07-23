// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { PushSubscriptionObject } from '@/types/push';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const subscription: PushSubscriptionObject = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ success: false, error: 'Inscrição inválida' }, { status: 400 });
    }

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        subscription: subscription
      }, {
        onConflict: 'user_id, subscription' 
      });

    if (error) {
      console.error('Erro ao salvar inscrição no Supabase:', error);
      return NextResponse.json({ success: false, error: 'Erro ao salvar inscrição' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Erro na API de inscrições:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}