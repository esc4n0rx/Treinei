// lib/storage.ts
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

    // Upload do arquivo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('treinei-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
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