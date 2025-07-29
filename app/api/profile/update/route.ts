// app/api/profile/update/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { updateUserProfile } from '@/lib/supabase/profile'
import { UpdateProfileData } from '@/types/profile'

export async function PATCH(request: NextRequest) {
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

    const body: UpdateProfileData = await request.json()

    // Validação
    if (!body.nome || body.nome.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'O nome é obrigatório.' },
        { status: 400 }
      )
    }

    const result = await updateUserProfile(userId, body)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de atualização de perfil:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}