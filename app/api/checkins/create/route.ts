// app/api/checkins/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createCheckin } from '@/lib/supabase/checkins'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')

    if (!token) {
      console.error('Token não fornecido')
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

    if (!grupo_id || !foto) {
      console.error('Dados obrigatórios faltando:', { grupo_id: !!grupo_id, foto: !!foto })
      return NextResponse.json(
        { success: false, error: 'ID do grupo e foto são obrigatórios' },
        { status: 400 }
      )
    }

    if (!foto.type.startsWith('image/')) {
      console.error('Tipo de arquivo inválido:', foto.type)
      return NextResponse.json(
        { success: false, error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 15MB)
    if (foto.size > 15 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Imagem muito grande. Máximo 15MB' },
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