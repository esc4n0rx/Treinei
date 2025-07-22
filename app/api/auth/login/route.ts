import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/api/auth'
import { LoginCredentials } from '@/types/auth'

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json()
    
    const { email, password } = body

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const result = await loginUser({ email, password })

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 401 })
    }
  } catch (error) {
    console.error('Erro na API de login:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}