import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createCheckin } from '@/lib/supabase/checkins'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API CHECKIN CREATE - INÍCIO ===')
    
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')

    if (!token) {
      console.error('Token não fornecido')
      return NextResponse.json(
        { success: false, error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    console.log('Token encontrado, verificando...')
    const decoded = verifyToken(token)
    const userId = decoded.userId
    console.log('Token válido para usuário:', userId)

    const formData = await request.formData()
    
    const grupo_id = formData.get('grupo_id') as string
    const observacao = formData.get('observacao') as string
    const local = formData.get('local') as string
    const data_checkin = formData.get('data_checkin') as string
    const foto = formData.get('foto') as File

    console.log('Dados do FormData:', {
      grupo_id,
      observacao,
      local,
      data_checkin,
      fotoName: foto?.name,
      fotoSize: foto?.size,
      fotoType: foto?.type
    })

    // Validações
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

    // Validar tamanho do arquivo (máximo 10MB)
    if (foto.size > 10 * 1024 * 1024) {
      console.error('Arquivo muito grande:', foto.size)
      return NextResponse.json(
        { success: false, error: 'Imagem muito grande. Máximo 10MB' },
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

    console.log('Chamando createCheckin...')
    const result = await createCheckin(checkinData, userId)

    console.log('Resultado do createCheckin:', { 
      success: result.success, 
      error: result.error,
      temCheckin: !!result.checkin
    })

    if (result.success) {
      console.log('=== API CHECKIN CREATE - SUCESSO ===')
      return NextResponse.json(result, { status: 201 })
    } else {
      console.log('=== API CHECKIN CREATE - ERRO DE NEGÓCIO ===')
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de criação de check-in:', error)
    console.log('=== API CHECKIN CREATE - ERRO INTERNO ===')
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}