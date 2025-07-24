// components/image-cropper.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crop as CropIcon, Loader2, SkipForward, Move, ZoomIn, ZoomOut } from "lucide-react"
import imageCompression from "browser-image-compression"
import { toast } from "sonner"

interface ImageCropperProps {
  imageToCrop: string
  onConfirm: (file: File) => void
  onCancel: () => void
}

export function ImageCropper({ imageToCrop, onConfirm, onCancel }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Carregar imagem
  useEffect(() => {
    if (!imageToCrop) return

    console.log('🖼️ Carregando imagem no cropper nativo...')
    const img = new Image()
    img.crossOrigin = "anonymous"
    
    img.onload = () => {
      console.log('✅ Imagem carregada:', {
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      })
      setImage(img)
      setImageLoaded(true)
      drawCanvas(img, scale, position)
    }
    
    img.onerror = (error) => {
      console.error('❌ Erro ao carregar imagem:', error)
      toast.error('Erro ao carregar imagem.')
    }
    
    img.src = imageToCrop
  }, [imageToCrop])

  // Desenhar no canvas
  const drawCanvas = useCallback((img: HTMLImageElement, currentScale: number, currentPosition: { x: number, y: number }) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const size = 300 // Tamanho fixo do canvas
    canvas.width = size
    canvas.height = size

    // Limpar canvas
    ctx.clearRect(0, 0, size, size)

    // Calcular dimensões da imagem para manter aspect ratio
    const imgAspect = img.width / img.height
    let drawWidth, drawHeight

    if (imgAspect > 1) {
      // Imagem mais larga que alta
      drawHeight = size * currentScale
      drawWidth = drawHeight * imgAspect
    } else {
      // Imagem mais alta que larga
      drawWidth = size * currentScale
      drawHeight = drawWidth / imgAspect
    }

    // Centralizar e aplicar posição
    const x = (size - drawWidth) / 2 + currentPosition.x
    const y = (size - drawHeight) / 2 + currentPosition.y

    // Desenhar imagem
    ctx.drawImage(img, x, y, drawWidth, drawHeight)

    // Desenhar grid de corte (círculo para aspecto 1:1)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    const cropSize = Math.min(size * 0.8, size * 0.8)
    const cropX = (size - cropSize) / 2
    const cropY = (size - cropSize) / 2
    
    ctx.strokeRect(cropX, cropY, cropSize, cropSize)
    
    // Escurecer áreas fora do crop
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.fillRect(0, 0, size, cropY) // Top
    ctx.fillRect(0, cropY + cropSize, size, size - cropY - cropSize) // Bottom
    ctx.fillRect(0, cropY, cropX, cropSize) // Left
    ctx.fillRect(cropX + cropSize, cropY, size - cropX - cropSize, cropSize) // Right
  }, [])

  // Atualizar canvas quando escala ou posição mudam
  useEffect(() => {
    if (image && imageLoaded) {
      drawCanvas(image, scale, position)
    }
  }, [image, imageLoaded, scale, position, drawCanvas])

  // Handlers para touch/mouse
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX - position.x, y: clientY - position.y })
  }

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    
    const newPosition = {
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    }
    
    // Limitar movimento para manter imagem visível
    const limit = 150
    newPosition.x = Math.max(-limit, Math.min(limit, newPosition.x))
    newPosition.y = Math.max(-limit, Math.min(limit, newPosition.y))
    
    setPosition(newPosition)
  }

  const handleEnd = () => {
    setIsDragging(false)
  }

  // Event handlers para mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleEnd()
  }

  // Event handlers para touch
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleEnd()
  }

  // Confirmar crop
  const handleConfirmCrop = async () => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    console.log('✂️ Iniciando crop...')
    setIsProcessing(true)

    try {
      // Criar canvas para o crop final
      const cropCanvas = document.createElement('canvas')
      const cropCtx = cropCanvas.getContext('2d')
      if (!cropCtx) throw new Error('Não foi possível criar contexto do canvas')

      const cropSize = 800 // Tamanho final da imagem croppada
      cropCanvas.width = cropSize
      cropCanvas.height = cropSize

      // Calcular posição e escala da imagem no crop
      const canvasSize = 300
      const displayCropSize = canvasSize * 0.8
      const scaleFactor = cropSize / displayCropSize

      // Calcular dimensões da imagem
      const imgAspect = image.width / image.height
      let drawWidth, drawHeight

      if (imgAspect > 1) {
        drawHeight = canvasSize * scale
        drawWidth = drawHeight * imgAspect
      } else {
        drawWidth = canvasSize * scale
        drawHeight = drawWidth / imgAspect
      }

      // Posição da imagem no canvas de display
      const displayX = (canvasSize - drawWidth) / 2 + position.x
      const displayY = (canvasSize - drawHeight) / 2 + position.y

      // Calcular área de crop em relação à imagem original
      const cropAreaX = (canvasSize * 0.1 - displayX) * scaleFactor
      const cropAreaY = (canvasSize * 0.1 - displayY) * scaleFactor
      const cropAreaWidth = displayCropSize * scaleFactor
      const cropAreaHeight = displayCropSize * scaleFactor

      // Calcular coordenadas na imagem original
      const scaleToOriginal = Math.max(
        image.width / (drawWidth * scaleFactor),
        image.height / (drawHeight * scaleFactor)
      )

      const sourceX = Math.max(0, cropAreaX * scaleToOriginal)
      const sourceY = Math.max(0, cropAreaY * scaleToOriginal)
      const sourceWidth = Math.min(image.width - sourceX, cropAreaWidth * scaleToOriginal)
      const sourceHeight = Math.min(image.height - sourceY, cropAreaHeight * scaleToOriginal)

      // Desenhar crop
      cropCtx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, cropSize, cropSize
      )

      // Converter para blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        cropCanvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Falha ao converter canvas'))
          }
        }, 'image/jpeg', 0.9)
      })

      console.log('✅ Crop criado:', blob.size)

      // Converter para File
      const file = new File([blob], "cropped-image.jpeg", { type: "image/jpeg" })

      // Comprimir se necessário
      let finalFile = file
      if (file.size > 1.5 * 1024 * 1024) {
        console.log('🗜️ Comprimindo imagem...')
        finalFile = await imageCompression(file, {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1280,
          useWebWorker: false,
          fileType: 'image/jpeg' as const,
          initialQuality: 0.85
        })
        console.log('✅ Compressão concluída:', finalFile.size)
      }

      toast.success('Foto editada com sucesso!')
      onConfirm(finalFile)

    } catch (error) {
      console.error('❌ Erro no crop:', error)
      toast.error('Erro ao processar imagem.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Usar original sem crop
  const handleSkipCrop = async () => {
    console.log('⏭️ Usando imagem original...')
    setIsProcessing(true)

    try {
      const response = await fetch(imageToCrop)
      const blob = await response.blob()
      let file = new File([blob], "image.jpeg", { type: "image/jpeg" })

      // Comprimir
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
      console.error('❌ Erro ao processar:', error)
      toast.error('Erro ao processar imagem.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="glass-card max-w-sm mx-4 p-4 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CropIcon className="h-5 w-5" />
            <span>Ajustar Foto</span>
          </DialogTitle>
          <DialogDescription>
            {imageLoaded ? "Arraste para posicionar e use os botões para zoom." : "Carregando imagem..."}
          </DialogDescription>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex-1 my-4"
        >
          {!imageLoaded ? (
            <div className="w-full h-[300px] bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm">Carregando...</p>
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className="relative w-full h-[300px] bg-gray-900 rounded-lg overflow-hidden cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ touchAction: 'none' }}
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
                <Move className="h-3 w-3" />
                <span>Arraste para ajustar</span>
              </div>
            </div>
          )}
        </motion.div>

        {imageLoaded && (
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Zoom</span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(Math.min(3, scale + 0.1))}
                  disabled={scale >= 3}
                >
                  <ZoomIn className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5x</span>
              <span>3x</span>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            className="glass hover:bg-white/10 w-full sm:w-auto" 
            onClick={onCancel} 
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
          
          {imageLoaded && (
            <Button 
              className="glass hover:bg-white/20 w-full sm:w-auto" 
              onClick={handleConfirmCrop}
              disabled={isProcessing}
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}