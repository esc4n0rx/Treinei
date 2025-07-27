import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

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

    verifyToken(token)

    const formData = await request.formData()
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string

    if (!file || !groupId) {
      return NextResponse.json(
        { success: false, error: 'Arquivo e ID do grupo são obrigatórios' },
        { status: 400 }
      )
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json(
            { success: false, error: 'Imagem muito grande. Máximo 5MB' },
            { status: 400 }
        )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadToCloudinary(buffer, {
      folder: 'treinei/gyncana_prizes',
      public_id: `prize_${groupId}_${Date.now()}`,
      transformation: {
        width: 600,
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
    }, { status: 200 })

  } catch (error) {
    console.error('Erro no upload da imagem do prêmio:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}