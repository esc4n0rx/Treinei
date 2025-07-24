// app/api/groups/[id]/manage/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGroupById, updateGroup } from '@/lib/supabase/groups'
import { UpdateGroupData } from '@/types/group'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    const userId = decoded.userId
    const groupId = params.id

    // Verificar se o usuário é administrador do grupo
    const groupResult = await getGroupById(groupId, userId)
    if (!groupResult.success || groupResult.group?.userMembership?.role !== 'administrador') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado. Você não é administrador deste grupo.' },
        { status: 403 }
      )
    }

    const body: UpdateGroupData = await request.json()

    const result = await updateGroup(groupId, body)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de gerenciamento de grupo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}