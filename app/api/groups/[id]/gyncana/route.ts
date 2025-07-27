import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { createGyncana, getActiveGyncanaByGroupId, getGyncanaRanking } from '@/lib/supabase/gyncana';
import { getGroupById } from '@/lib/supabase/groups';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');
    if (!token) return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });

    const decoded = verifyToken(token);
    const userId = decoded.userId;
    const { id: groupId } = await params; // Aguardar os parâmetros

    // Check if user is admin
    const groupResult = await getGroupById(groupId, userId);
    if (!groupResult.success || groupResult.group?.userMembership?.role !== 'administrador') {
      return NextResponse.json({ success: false, error: 'Acesso negado.' }, { status: 403 });
    }

    const formData = await request.formData();
    const prizeDescription = formData.get('prizeDescription') as string;
    const prizeImage = formData.get('prizeImage') as File | null;
    const participantIds = JSON.parse(formData.get('participantIds') as string);
    const startDate = new Date(formData.get('startDate') as string);
    const endDate = new Date(formData.get('endDate') as string);

    if (!prizeDescription || !participantIds || participantIds.length < 2 || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Dados inválidos.' }, { status: 400 });
    }

    // --- CORREÇÃO CRÍTICA: AJUSTAR A DATA DE TÉRMINO ---
    // Define a hora para o final do dia para incluir todos os check-ins do último dia.
    endDate.setHours(23, 59, 59, 999);
    // --- FIM DA CORREÇÃO ---

    let prize_image_url: string | undefined = undefined;
    if (prizeImage) {
      const bytes = await prizeImage.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, {
        folder: 'treinei/gyncana_prizes',
        public_id: `prize_${groupId}_${Date.now()}`,
      });
      prize_image_url = result.secure_url;
    }

    const gyncanaData = {
      group_id: groupId,
      prize_description: prizeDescription,
      prize_image_url,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      created_by: userId,
    };

    const result = await createGyncana(gyncanaData, participantIds);

    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating gyncana:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader || '');
    if (!token) return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 });

    verifyToken(token);
    const { id: groupId } = await params; // Aguardar os parâmetros

    const gyncana = await getActiveGyncanaByGroupId(groupId);

    if (!gyncana) {
      return NextResponse.json({ success: true, ranking: [], gyncana: null });
    }

    const ranking = await getGyncanaRanking(gyncana);

    return NextResponse.json({ success: true, ranking, gyncana });

  } catch (error) {
    console.error('Error fetching gyncana ranking:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}