import { NextRequest, NextResponse } from 'next/server'
import { loginWithGoogle } from '@/lib/api/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { name, email, picture } = body

    // Validação básica
    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await loginWithGoogle({ name, email, picture })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de login com Google:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}