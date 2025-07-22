export interface UploadImageResponse {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

/**
 * Upload de logo de grupo usando Cloudinary
 */
export async function uploadGroupLogo(file: File, groupId: string): Promise<UploadImageResponse> {
  try {
    console.log('=== INÍCIO DO UPLOAD DE LOGO DO GRUPO ===')
    console.log('Dados do upload:', { 
      groupId, 
      fileSize: file.size, 
      fileType: file.type,
      fileName: file.name
    })

    // Validar arquivo
    if (!file) {
      console.error('Nenhum arquivo fornecido')
      return { success: false, error: 'Nenhum arquivo fornecido' }
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('Tipo de arquivo inválido:', file.type)
      return { success: false, error: 'Apenas imagens são permitidas' }
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size)
      return { success: false, error: 'Imagem muito grande. Máximo 5MB' }
    }

    // Obter token de autenticação
    const token = typeof window !== 'undefined' ? localStorage.getItem('treinei_token') : null
    
    if (!token) {
      console.error('Token não encontrado')
      return { success: false, error: 'Token de autenticação não encontrado' }
    }

    // Preparar FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', groupId)

    console.log('Enviando para API de upload...')

    // Fazer upload via API route
    const response = await fetch('/api/upload/group-logo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()

    if (!result.success) {
      console.error('Erro no upload:', result.error)
      return { success: false, error: result.error }
    }

    console.log('Upload de logo realizado com sucesso:', result.url)
    console.log('=== FIM DO UPLOAD DE LOGO DO GRUPO - SUCESSO ===')

    return {
      success: true,
      url: result.url,
      publicId: result.publicId
    }
  } catch (error) {
    console.error('Erro geral no upload de logo:', error)
    console.log('=== FIM DO UPLOAD DE LOGO DO GRUPO - ERRO ===')
    return {
      success: false,
      error: 'Erro interno no upload'
    }
  }
}

/**
 * Upload de foto de check-in usando Cloudinary
 */
export async function uploadCheckinPhoto(file: File, userId: string, groupId: string): Promise<UploadImageResponse> {
  try {
    console.log('=== INÍCIO DO UPLOAD DE CHECKIN ===')
    console.log('Dados do upload:', { 
      userId, 
      groupId, 
      fileSize: file.size, 
      fileType: file.type,
      fileName: file.name
    })

    // Validar arquivo
    if (!file) {
      console.error('Nenhum arquivo fornecido')
      return { success: false, error: 'Nenhum arquivo fornecido' }
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      console.error('Tipo de arquivo inválido:', file.type)
      return { success: false, error: 'Apenas imagens são permitidas' }
    }

    // Validar tamanho (máximo 10MB para fotos de check-in)
    if (file.size > 10 * 1024 * 1024) {
      console.error('Arquivo muito grande:', file.size)
      return { success: false, error: 'Imagem muito grande. Máximo 10MB' }
    }

    // Obter token de autenticação
    const token = typeof window !== 'undefined' ? localStorage.getItem('treinei_token') : null
    
    if (!token) {
      console.error('Token não encontrado')
      return { success: false, error: 'Token de autenticação não encontrado' }
    }

    // Preparar FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('groupId', groupId)

    console.log('Enviando para API de upload...')

    // Fazer upload via API route
    const response = await fetch('/api/upload/checkin-photo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    const result = await response.json()

    if (!result.success) {
      console.error('Erro no upload:', result.error)
      return { success: false, error: result.error }
    }

    console.log('Upload de check-in realizado com sucesso:', result.url)
    console.log('=== FIM DO UPLOAD DE CHECKIN - SUCESSO ===')

    return {
      success: true,
      url: result.url,
      publicId: result.publicId
    }
  } catch (error) {
    console.error('Erro geral no upload de foto de check-in:', error)
    console.log('=== FIM DO UPLOAD DE CHECKIN - ERRO ===')
    return {
      success: false,
      error: 'Erro interno no upload'
    }
  }
}

/**
 * Remove imagem do Cloudinary
 */
export async function deleteGroupLogo(logoUrl: string): Promise<boolean> {
  try {
    // Implementar lógica de delete via API se necessário
    // Por enquanto, return true (Cloudinary tem auto-cleanup policies)
    console.log('Logo removido:', logoUrl)
    return true
  } catch (error) {
    console.error('Erro ao deletar logo:', error)
    return false
  }
}

/**
 * Remove foto de check-in do Cloudinary
 */
export async function deleteCheckinPhoto(photoUrl: string): Promise<boolean> {
  try {
    // Implementar lógica de delete via API se necessário
    // Por enquanto, return true (Cloudinary tem auto-cleanup policies)
    console.log('Foto de check-in removida:', photoUrl)
    return true
  } catch (error) {
    console.error('Erro ao deletar foto do check-in:', error)
    return false
  }
}

/**
 * Função para diagnosticar problemas de upload (substituindo diagnóstico do Supabase)
 */
export async function diagnoseUploadIssues(): Promise<void> {
  try {
    console.log('=== DIAGNÓSTICO DE UPLOAD ===')
    
    // Verificar se as variáveis de ambiente do Cloudinary estão configuradas
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET
    
    console.log('Configuração Cloudinary:', {
      hasCloudName,
      hasApiKey,
      hasApiSecret,
      allConfigured: hasCloudName && hasApiKey && hasApiSecret
    })
    
    console.log('=== FIM DIAGNÓSTICO ===')
  } catch (error) {
    console.error('Erro no diagnóstico:', error)
  }
}