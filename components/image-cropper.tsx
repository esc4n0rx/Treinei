// components/image-cropper.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Crop as CropIcon, Loader2 } from "lucide-react"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from "browser-image-compression"
import { toast } from "sonner"

interface ImageCropperProps {
  imageToCrop: string
  onConfirm: (file: File) => void
  onCancel: () => void
}

function getCroppedImg(image: HTMLImageElement, crop: Crop): Promise<File | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return Promise.resolve(null);

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0, 0, crop.width, crop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }
      resolve(new File([blob], "cropped-image.jpeg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.95);
  });
}

export function ImageCropper({ imageToCrop, onConfirm, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [isProcessing, setIsProcessing] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Log para debug
  useEffect(() => {
    console.log('🎨 ImageCropper montado:', {
      imageToCrop: !!imageToCrop,
      imageToCropLength: imageToCrop.length
    })
    
    return () => {
      console.log('🗑️ ImageCropper desmontado')
    }
  }, [imageToCrop])

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.log('📷 Imagem carregada no cropper')
    const { width, height } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    )
    setCrop(initialCrop)
    setImageLoaded(true)
  }

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !crop?.width || !crop.height) {
      console.error('❌ Dados do crop inválidos:', {
        imgRef: !!imgRef.current,
        cropWidth: crop?.width,
        cropHeight: crop?.height
      })
      toast.error("Recorte inválido. Tente novamente.")
      return
    }

    console.log('✂️ Iniciando processo de crop...')
    setIsProcessing(true)
    
    try {
      const croppedFile = await getCroppedImg(imgRef.current, crop)
      if (!croppedFile) {
        console.error('❌ Falha ao gerar arquivo croppado')
        toast.error("Não foi possível recortar a imagem.")
        setIsProcessing(false)
        return
      }

      console.log('✅ Imagem croppada com sucesso:', croppedFile.size)

      // Comprimir com configuração mais conservadora para produção
      const compressionOptions = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1280,
        useWebWorker: false, // Desabilitar web worker em produção para evitar problemas
        fileType: 'image/jpeg' as const,
        initialQuality: 0.8
      }

      console.log('🗜️ Iniciando compressão com opções:', compressionOptions)

      const compressedFile = await imageCompression(croppedFile, compressionOptions)
      
      console.log('✅ Compressão concluída:', {
        tamanhoOriginal: croppedFile.size,
        tamanhoComprimido: compressedFile.size,
        reducao: ((croppedFile.size - compressedFile.size) / croppedFile.size * 100).toFixed(1) + '%'
      })

      toast.success('Foto pronta para o check-in!')
      onConfirm(compressedFile)
      
    } catch (error) {
      console.error('❌ Erro no processo de crop/compressão:', error)
      toast.error('Falha ao processar a imagem. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCancel = () => {
    console.log('❌ Usuário cancelou o crop')
    onCancel()
  }

  // Verificação adicional de segurança
  if (!imageToCrop) {
    console.warn('⚠️ ImageCropper renderizado sem imageToCrop')
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
          <DialogDescription>Selecione a área que deseja mostrar.</DialogDescription>
        </DialogHeader>
        
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex-1 flex items-center justify-center my-4 min-h-[300px]"
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          )}
          
          <ReactCrop 
            crop={crop} 
            onChange={c => setCrop(c)} 
            aspect={1} 
            minWidth={100}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          >
            <img 
              ref={imgRef} 
              src={imageToCrop} 
              onLoad={onImageLoad}
              onError={(e) => {
                console.error('❌ Erro ao carregar imagem no cropper:', e)
                toast.error('Erro ao carregar a imagem.')
              }}
              alt="Imagem para recortar" 
              className="max-h-[60vh] object-contain" 
            />
          </ReactCrop>
        </motion.div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            className="glass hover:bg-white/10" 
            onClick={handleCancel} 
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button 
            className="glass hover:bg-white/20" 
            onClick={handleConfirmCrop} 
            disabled={isProcessing || !imageLoaded}
          >
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}