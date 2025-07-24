// components/image-cropper.tsx
"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crop as CropIcon, Loader2, SkipForward, AlertCircle } from "lucide-react"
import Cropper from 'react-easy-crop'
import imageCompression from "browser-image-compression"
import { toast } from "sonner"

interface ImageCropperProps {
  imageToCrop: string
  onConfirm: (file: File) => void
  onCancel: () => void
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

// Função para criar imagem croppada usando canvas
const createCroppedImage = async (
  imageSrc: string,
  cropArea: CropArea
): Promise<File | null> => {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous" // Adicionar CORS
    
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        console.error('❌ Não foi possível obter contexto do canvas')
        resolve(null)
        return
      }

      // Definir tamanho do canvas baseado na área de crop
      canvas.width = cropArea.width
      canvas.height = cropArea.height

      // Desenhar a parte croppada da imagem
      ctx.drawImage(
        image,
        cropArea.x,
        cropArea.y,
        cropArea.width,
        cropArea.height,
        0,
        0,
        cropArea.width,
        cropArea.height
      )

      // Converter canvas para blob e depois para File
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('❌ Falha ao converter canvas para blob')
          resolve(null)
          return
        }
        console.log('✅ Canvas convertido para blob:', blob.size)
        resolve(new File([blob], "cropped-image.jpeg", { type: "image/jpeg" }))
      }, 'image/jpeg', 0.95)
    }
    
    image.onerror = (error) => {
      console.error('❌ Erro ao carregar imagem:', error)
      resolve(null)
    }
    
    image.src = imageSrc
  })
}

export function ImageCropper({ imageToCrop, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

  // Validar e preparar imagem
  useEffect(() => {
    console.log('🔍 Validando imagem recebida:', {
      hasImage: !!imageToCrop,
      imageLength: imageToCrop?.length,
      startsWithData: imageToCrop?.startsWith('data:image/'),
      type: imageToCrop?.substring(0, 50)
    })

    if (!imageToCrop) {
      console.error('❌ Nenhuma imagem fornecida')
      setImageError(true)
      return
    }

    if (!imageToCrop.startsWith('data:image/')) {
      console.error('❌ Formato de imagem inválido - não é base64 data URL')
      setImageError(true)
      return
    }

    // Reset states
    setImageLoaded(false)
    setImageError(false)
    setShowFallback(false)

    // Testar se a imagem pode ser carregada
    const testImage = new Image()
    testImage.onload = () => {
      console.log('✅ Imagem validada com sucesso:', {
        width: testImage.width,
        height: testImage.height
      })
      setImageLoaded(true)
    }
    testImage.onerror = (error) => {
      console.error('❌ Erro ao validar imagem:', error)
      setImageError(true)
      setShowFallback(true)
    }
    testImage.src = imageToCrop

    // Timeout para fallback em caso de demora
    const timeout = setTimeout(() => {
      if (!imageLoaded && !imageError) {
        console.warn('⚠️ Timeout no carregamento da imagem, mostrando fallback')
        setShowFallback(true)
      }
    }, 5000)

    return () => clearTimeout(timeout)
  }, [imageToCrop, imageLoaded, imageError])

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: CropArea) => {
      console.log('✂️ Crop atualizado:', { croppedArea, croppedAreaPixels })
      setCroppedAreaPixels(croppedAreaPixels)
    },
    []
  )

  const handleConfirmCrop = async () => {
    if (!croppedAreaPixels) {
      toast.error("Área de corte não definida. Tente novamente.")
      return
    }

    console.log('🚀 Iniciando processo de crop...')
    setIsProcessing(true)

    try {
      const croppedFile = await createCroppedImage(imageToCrop, croppedAreaPixels)
      
      if (!croppedFile) {
        console.error('❌ Falha ao criar imagem croppada')
        toast.error("Não foi possível recortar a imagem.")
        setIsProcessing(false)
        return
      }

      console.log('✅ Imagem croppada com sucesso:', croppedFile.size)

      // Compressão com configurações otimizadas para mobile
      const compressionOptions = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1280,
        useWebWorker: false,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.85
      }

      console.log('🗜️ Iniciando compressão...')
      const compressedFile = await imageCompression(croppedFile, compressionOptions)
      
      console.log('✅ Compressão concluída:', {
        tamanhoOriginal: croppedFile.size,
        tamanhoComprimido: compressedFile.size
      })

      toast.success('Foto editada com sucesso!')
      onConfirm(compressedFile)

    } catch (error) {
      console.error('❌ Erro no processo:', error)
      toast.error('Erro ao processar imagem. Tente usar sem corte.')
      setShowFallback(true)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSkipCrop = async () => {
    console.log('⏭️ Usuário escolheu pular o crop')
    setIsProcessing(true)

    try {
      // Converter base64 para File sem crop
      const response = await fetch(imageToCrop)
      const blob = await response.blob()
      let file = new File([blob], "image.jpeg", { type: "image/jpeg" })

      // Ainda aplicar compressão
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1280,
        useWebWorker: false,
        fileType: 'image/jpeg' as const,
        initialQuality: 0.85
      })

      toast.success('Foto processada!')
      onConfirm(compressedFile)
    } catch (error) {
      console.error('❌ Erro ao processar sem crop:', error)
      toast.error('Erro ao processar imagem.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    console.log('❌ Crop cancelado')
    onCancel()
  }

  if (!imageToCrop) {
    console.warn('⚠️ ImageCropper sem imagem')
    return null
  }

  return (
    <Dialog open={true} onOpenChange={handleCancel}>
      <DialogContent className="glass-card max-w-md mx-4 p-4 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CropIcon className="h-5 w-5" />
            <span>Ajustar Foto</span>
          </DialogTitle>
          <DialogDescription>
            {imageError || showFallback
              ? "Problema ao carregar imagem. Você pode usar a foto original."
              : imageLoaded 
                ? "Arraste para posicionar e use o zoom para ajustar."
                : "Carregando imagem..."
            }
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="relative flex-1 my-4 min-h-[300px] bg-gray-900 rounded-lg overflow-hidden"
        >
          {!imageLoaded && !imageError && !showFallback && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Carregando imagem...</p>
              </div>
            </div>
          )}

          {imageError && !showFallback && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
                <p className="text-sm">Erro ao carregar imagem</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowFallback(true)}
                >
                  Ver imagem original
                </Button>
              </div>
            </div>
          )}

          {imageLoaded && !showFallback && !imageError && (
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: {
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  backgroundColor: '#1f2937'
                },
                mediaStyle: {
                  maxHeight: '100%',
                  maxWidth: '100%'
                }
              }}
              showGrid={true}
              zoomSpeed={0.5}
            />
          )}

          {showFallback && (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img 
                src={imageToCrop} 
                alt="Imagem original" 
                className="max-w-full max-h-full object-contain rounded"
                onError={(e) => {
                  console.error('❌ Erro ao exibir imagem no fallback')
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                }}
                onLoad={() => console.log('✅ Imagem carregada no fallback')}
              />
            </div>
          )}
        </motion.div>

        {imageLoaded && !showFallback && !imageError && (
          <div className="mb-4">
            <label className="text-sm text-muted-foreground mb-2 block">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoom - 1) / 2) * 100}%, #374151 ${((zoom - 1) / 2) * 100}%, #374151 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>1x</span>
              <span>3x</span>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            className="glass hover:bg-white/10 w-full sm:w-auto" 
            onClick={handleCancel} 
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          
          <Button
            variant="outline"
            className="glass hover:bg-white/10 w-full sm:w-auto"
            onClick={handleSkipCrop}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <SkipForward className="mr-2 h-4 w-4" />
            )}
            Usar Original
          </Button>
          
          {imageLoaded && !imageError && (
            <Button 
              className="glass hover:bg-white/20 w-full sm:w-auto" 
              onClick={handleConfirmCrop}
              disabled={isProcessing || !croppedAreaPixels}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar Corte
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}