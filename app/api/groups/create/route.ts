import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { createGroup } from '@/lib/supabase/groups'

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
    
    const nome = formData.get('nome') as string
    const descricao = formData.get('descricao') as string
    const tipo = formData.get('tipo') as 'publico' | 'privado'
    const senha = formData.get('senha') as string
    const maxMembros = formData.get('max_membros') as string
    const logo = formData.get('logo') as File

    // Validações
    if (!nome || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      )
    }

    if (tipo === 'privado' && !senha) {
      return NextResponse.json(
        { success: false, error: 'Senha é obrigatória para grupos privados' },
        { status: 400 }
      )
    }

    const groupData = {
      nome,
      descricao: descricao || undefined,
      tipo,
      senha: senha || undefined,
      max_membros: maxMembros ? parseInt(maxMembros) : undefined,
      logo: logo && logo.size > 0 ? logo : undefined
    }

    const result = await createGroup(groupData, userId)

    if (result.success) {
      return NextResponse.json(result, { status: 201 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de criação de grupo:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}