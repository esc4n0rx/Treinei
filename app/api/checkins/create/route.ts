import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createCheckin } from '@/lib/supabase/checkins'

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    
    const grupo_id = formData.get('grupo_id') as string
    const observacao = formData.get('observacao') as string
    const local = formData.get('local') as string
    const data_checkin = formData.get('data_checkin') as string
    const foto = formData.get('foto') as File

    // Validações
    if (!grupo_id || !foto) {
      return NextResponse.json(
        { success: false, error: 'ID do grupo e foto são obrigatórios' },
        { status: 400 }
      )
    }

    if (!foto.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }

    const checkinData = {
      grupo_id,
      foto,
      observacao: observacao || undefined,
      local: local || undefined,
      data_checkin: data_checkin || undefined
    }

    const result = await createCheckin(checkinData, userId)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de criação de check-in:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}