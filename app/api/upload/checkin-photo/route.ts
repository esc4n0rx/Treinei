import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from '@/lib/auth'
import { uploadToCloudinary } from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  try {
    console.log('=== API UPLOAD CHECKIN PHOTO - INÍCIO ===')
    
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
    const file = formData.get('file') as File
    const groupId = formData.get('groupId') as string

    console.log('Dados do FormData:', {
      userId,
      groupId,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    })

    // Validações
    if (!file || !groupId) {
      console.error('Dados obrigatórios faltando:', { file: !!file, groupId: !!groupId })
      return NextResponse.json(
        { success: false, error: 'Arquivo e ID do grupo são obrigatórios' },
        { status: 400 }
      )
    }

    if (!file.type.startsWith('image/')) {
      console.error('Tipo de arquivo inválido:', file.type)
      return NextResponse.json(
        { success: false, error: 'Apenas imagens são permitidas' },
        { status: 400 }
      )
    }

    // Validar tamanho do arquivo (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size)
      return NextResponse.json(
        { success: false, error: 'Imagem muito grande. Máximo 10MB' },
        { status: 400 }
      )
    }

    // Converter File para Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log('Iniciando upload para Cloudinary...')
    
    // Upload para Cloudinary com transformações específicas para fotos de check-in
    const result = await uploadToCloudinary(buffer, {
      folder: 'treinei/checkins',
      public_id: `checkin_${userId}_${groupId}_${Date.now()}`,
      transformation: {
        width: 1080,
        height: 1080,
        crop: 'limit',
        quality: 'auto:good',
        fetch_format: 'auto'
      }
    })

    console.log('Upload realizado com sucesso:', {
      publicId: result.public_id,
      url: result.secure_url,
      size: result.bytes
    })

    console.log('=== API UPLOAD CHECKIN PHOTO - SUCESSO ===')

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes
    }, { status: 200 })

  } catch (error) {
    console.error('Erro na API de upload de foto de check-in:', error)
    console.log('=== API UPLOAD CHECKIN PHOTO - ERRO INTERNO ===')
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}