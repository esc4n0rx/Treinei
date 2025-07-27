import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { endGyncanaAndDeclareWinner } from '@/lib/supabase/gyncana';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const { groupId } = await request.json();

    if (!groupId) {
      return NextResponse.json({ success: false, error: 'ID do grupo é obrigatório' }, { status: 400 });
    }

    const result = await endGyncanaAndDeclareWinner(groupId, userId);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      // Se não houver gincana finalizada, não é um erro, apenas não há nada a fazer.
      if (result.error === 'Nenhuma gincana finalizada encontrada.') {
        return NextResponse.json({ success: true, data: null });
      }
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error) {
    console.error('Erro na API de verificação de vencedor da gincana:', error);
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 });
  }
}