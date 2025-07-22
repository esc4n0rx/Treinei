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
    const fileExt = file.name.split('.').pop()
    const fileName = `group-${groupId}-${Date.now()}.${fileExt}`
    const filePath = `grupos/${fileName}`

    // Upload do arquivo
    const { error: uploadError } = await supabase.storage
      .from('treinei-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('Erro no upload:', uploadError)
      return {
        success: false,
        error: 'Erro ao fazer upload da imagem'
      }
    }

    // Obter URL pública
    const { data } = supabase.storage
      .from('treinei-images')
      .getPublicUrl(filePath)

    return {
      success: true,
      url: data.publicUrl
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

    return !error
  } catch (error) {
    console.error('Erro ao deletar imagem:', error)
    return false
  }
}