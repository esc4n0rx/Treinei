import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getCheckinComments, addCheckinComment } from '@/lib/supabase/checkins'

export async function GET(
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
    const checkinId = params.id

    if (!checkinId) {
      return NextResponse.json(
        { success: false, error: 'ID do check-in é obrigatório' },
        { status: 400 }
      )
    }

    const result = await getCheckinComments(checkinId)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de comentários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const checkinId = params.id

    if (!checkinId) {
      return NextResponse.json(
        { success: false, error: 'ID do check-in é obrigatório' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { conteudo } = body

    if (!conteudo || !conteudo.trim()) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo do comentário é obrigatório' },
        { status: 400 }
      )
    }

    if (conteudo.trim().length > 500) {
      return NextResponse.json(
        { success: false, error: 'Comentário muito longo (máximo 500 caracteres)' },
        { status: 400 }
      )
    }

    const result = await addCheckinComment(checkinId, userId, conteudo.trim())

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de comentários:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}