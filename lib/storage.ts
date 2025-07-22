import { supabase } from './supabase'

export interface UploadImageResponse {
  success: boolean
  url?: string
  error?: string
}

/**
 * Upload de imagem para o bucket do Supabase
 */
export async function uploadGroupLogo(file: File, groupId: string): Promise<UploadImageResponse> {
  try {
    // Validar arquivo
    if (!file) {
      return { success: false, error: 'Nenhum arquivo fornecido' }
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'Apenas imagens são permitidas' }
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'Imagem muito grande. Máximo 5MB' }
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `group-${groupId}-${Date.now()}.${fileExt}`
    const filePath = `grupos/${fileName}`

    console.log('Iniciando upload:', { fileName, fileSize: file.size, fileType: file.type })

    // Upload do arquivo com configurações específicas para evitar RLS
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('treinei-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        duplex: 'half' // Adicionar esta configuração
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return {
        success: false,
        error: `Erro ao fazer upload: ${uploadError.message}`
      }
    }

    console.log('Upload realizado com sucesso:', uploadData)

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('treinei-images')
      .getPublicUrl(filePath)

    if (!publicUrlData?.publicUrl) {
      return {
        success: false,
        error: 'Erro ao obter URL pública da imagem'
      }
    }

    console.log('URL pública gerada:', publicUrlData.publicUrl)

    return {
      success: true,
      url: publicUrlData.publicUrl
    }
  } catch (error) {
    console.error('Erro no upload de imagem:', error)
    return {
      success: false,
      error: 'Erro interno no upload'
    }
  }
}

/**
 * Upload de foto de check-in com configurações otimizadas
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

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const fileName = `checkin-${userId}-${groupId}-${Date.now()}.${fileExt}`
    const filePath = `checkins/${fileName}`

    console.log('Configuração do upload:', { fileName, filePath })

    // Verificar se o bucket existe e é acessível
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      console.log('Buckets disponíveis:', buckets?.map(b => b.name))
      
      if (bucketsError) {
        console.error('Erro ao listar buckets:', bucketsError)
      }
    } catch (error) {
      console.error('Erro ao verificar buckets:', error)
    }

    // Tentar upload com configurações específicas
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('treinei-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Erro detalhado no upload:', {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError
      })
      
      // Tentar diagnóstico adicional
      if (uploadError.message?.includes('row-level security') || uploadError.statusCode === '403') {
        console.log('Erro de RLS detectado, tentando diagnóstico...')
        
        // Verificar políticas do bucket
        try {
          const { data: policies, error: policiesError } = await supabase.rpc('get_storage_policies', {
            bucket_name: 'treinei-images'
          })
          console.log('Políticas do bucket:', policies)
        } catch (policyError) {
          console.log('Não foi possível verificar políticas:', policyError)
        }
      }
      
      return {
        success: false,
        error: `Erro ao fazer upload: ${uploadError.message} (Código: ${uploadError.statusCode})`
      }
    }

    console.log('Upload realizado com sucesso:', uploadData)

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('treinei-images')
      .getPublicUrl(filePath)

    if (!publicUrlData?.publicUrl) {
      console.error('Erro ao gerar URL pública')
      return {
        success: false,
        error: 'Erro ao obter URL pública da imagem'
      }
    }

    console.log('URL pública do check-in gerada:', publicUrlData.publicUrl)
    console.log('=== FIM DO UPLOAD DE CHECKIN - SUCESSO ===')

    return {
      success: true,
      url: publicUrlData.publicUrl
    }
  } catch (error) {
    console.error('Erro geral no upload de imagem de check-in:', error)
    console.log('=== FIM DO UPLOAD DE CHECKIN - ERRO ===')
    return {
      success: false,
      error: 'Erro interno no upload'
    }
  }
}

/**
 * Remove imagem do bucket
 */
export async function deleteGroupLogo(logoUrl: string): Promise<boolean> {
  try {
    // Extrair path da URL
    const urlParts = logoUrl.split('/storage/v1/object/public/treinei-images/')
    if (urlParts.length < 2) return false
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('treinei-images')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar imagem:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return false
  }
}

/**
 * Remove foto de check-in do bucket
 */
export async function deleteCheckinPhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extrair path da URL
    const urlParts = photoUrl.split('/storage/v1/object/public/treinei-images/')
    if (urlParts.length < 2) return false
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('treinei-images')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar foto do check-in:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Erro ao deletar foto do check-in:', error)
    return false
  }
}

/**
 * Função para diagnosticar problemas de storage
 */
export async function diagnoseStorageIssues(): Promise<void> {
  try {
    console.log('=== DIAGNÓSTICO DE STORAGE ===')
    
    // Verificar buckets
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('Buckets:', buckets)
    if (bucketsError) console.error('Erro buckets:', bucketsError)
    
    // Verificar arquivos no bucket
    const { data: files, error: filesError } = await supabase.storage
      .from('treinei-images')
      .list('checkins', { limit: 5 })
    console.log('Arquivos em checkins/', files)
    if (filesError) console.error('Erro arquivos:', filesError)
    
    console.log('=== FIM DIAGNÓSTICO ===')
  } catch (error) {
    console.error('Erro no diagnóstico:', error)
  }
}