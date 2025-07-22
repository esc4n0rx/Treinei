import { NextRequest, NextResponse } from 'next/server'
import { getPublicGroups } from '@/lib/supabase/groups'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || undefined
    const limit = parseInt(searchParams.get('limit') || '20')

    const result = await getPublicGroups(search, limit)

    if (result.success) {
      return NextResponse.json({
        success: true,
        groups: result.groups
      })
    } else {
      return NextResponse.json(result, { status: 400 })
    }
  } catch (error) {
    console.error('Erro na API de grupos públicos:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}