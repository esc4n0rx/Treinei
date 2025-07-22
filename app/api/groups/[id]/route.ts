import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { getGroupById } from '@/lib/supabase/groups'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = extractTokenFromHeader(authHeader || '')
    
    let userId: string | undefined
    
    if (token) {
      try {
        const decoded = verifyToken(token)
        userId = decoded.userId
      } catch {
        // Token inválido, mas ainda pode ver grupos públicos
      }
    }

    const result = await getGroupById(params.id, userId)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(result, { status: 404 })
    }
  } catch (error) {
    console.error('Erro na API de grupo específico:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}