import { v2 as cloudinary, UploadApiOptions } from 'cloudinary'

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

/**
 * Upload de imagem para Cloudinary com transformações
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder: string
    public_id?: string
    transformation?: object
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
  }
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {

    const {
      resource_type = 'image',
      transformation = { quality: 'auto:good', fetch_format: 'auto' },
      ...otherOptions
    } = options

    const uploadOptions: UploadApiOptions = {
      resource_type,
      transformation,
      ...otherOptions,
    }

    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Erro no upload Cloudinary:', error)
          reject(error)
        } else if (result) {
          resolve(result as CloudinaryUploadResult)
        } else {
          reject(new Error('Resultado de upload indefinido'))
        }
      }
    ).end(fileBuffer)
  })
}

/**
 * Remove imagem do Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result.result === 'ok'
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error)
    return false
  }
}

/**
 * Gera URL com transformações específicas
 */
export function buildCloudinaryUrl(
  publicId: string, 
  transformations?: object
): string {
  return cloudinary.url(publicId, transformations)
}

/**
 * Extrai public_id de uma URL do Cloudinary
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    const regex = /\/v\d+\/(.+)\.[^.]+$/
    const match = url.match(regex)
    return match ? match[1] : null
  } catch (error) {
    console.error('Erro ao extrair public_id:', error)
    return null
  }
}

export default cloudinary