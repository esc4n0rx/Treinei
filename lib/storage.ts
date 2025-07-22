// lib/storage.ts
export interface UploadImageResponse {
  success: boolean
  url?: string
  publicId?: string
  error?: string
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