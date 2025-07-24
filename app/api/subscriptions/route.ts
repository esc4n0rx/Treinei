// app/api/subscriptions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;

    const { fcm_token } = await request.json();

    if (!fcm_token) {
      return NextResponse.json({ success: false, error: 'Token FCM inválido' }, { status: 400 });
    }

    // Upsert para inserir o novo token ou atualizar um existente para o mesmo usuário
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        fcm_token: fcm_token
      }, {
        onConflict: 'user_id' // Se já existir um registro para este user_id, atualize-o
      });

    if (error) {
      console.error('Erro ao salvar token FCM no Supabase:', error);
      // Se o erro for de chave duplicada no fcm_token, significa que outro usuário já registrou este token.
      // Podemos optar por ignorar ou tratar como um caso especial. Por agora, retornamos erro.
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ success: false, error: 'Este dispositivo já está registrado.' }, { status: 409 });
      }
      return NextResponse.json({ success: false, error: 'Erro ao salvar token' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Token salvo com sucesso' }, { status: 201 });
  } catch (error) {
    console.error('Erro na API de inscrições:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}