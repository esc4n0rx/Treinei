// app/api/groups/[id]/members/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGroupById, removeGroupMember, updateMemberRole } from '@/lib/supabase/groups'

async function checkAdmin(groupId: string, userId: string) {
  const groupResult = await getGroupById(groupId, userId)
  if (!groupResult.success || groupResult.group?.userMembership?.role !== 'administrador') {
    return { isAdmin: false, error: 'Acesso negado. Você não é administrador deste grupo.' }
  }
  return { isAdmin: true, group: groupResult.group }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')
    if (!token) return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 })

    const decoded = verifyToken(token)
    const adminId = decoded.userId
    const groupId = params.id
    const { memberUserId } = await request.json()

    if (!memberUserId) {
      return NextResponse.json({ success: false, error: 'ID do membro é obrigatório' }, { status: 400 })
    }
    
    const { isAdmin, error: adminError } = await checkAdmin(groupId, adminId)
    if (!isAdmin) return NextResponse.json({ success: false, error: adminError }, { status: 403 })

    const result = await removeGroupMember(groupId, memberUserId)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de remoção de membro:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')
    if (!token) return NextResponse.json({ success: false, error: 'Token não fornecido' }, { status: 401 })

    const decoded = verifyToken(token)
    const adminId = decoded.userId
    const groupId = params.id
    const { memberUserId, role } = await request.json()

    if (!memberUserId || !role) {
      return NextResponse.json({ success: false, error: 'ID do membro e cargo são obrigatórios' }, { status: 400 })
    }

    const { isAdmin, error: adminError } = await checkAdmin(groupId, adminId)
    if (!isAdmin) return NextResponse.json({ success: false, error: adminError }, { status: 403 })
    
    const result = await updateMemberRole(groupId, memberUserId, role)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de atualização de cargo:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}