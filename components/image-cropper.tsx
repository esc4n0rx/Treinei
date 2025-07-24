// components/image-cropper.tsx
"use client"

import { useState, useRef } from "react"
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
  const imgRef = useRef<HTMLImageElement | null>(null)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    )
    setCrop(initialCrop)
  }

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !crop?.width || !crop.height) {
      toast.error("Recorte inválido. Tente novamente.")
      return
    }

    setIsProcessing(true)
    const croppedFile = await getCroppedImg(imgRef.current, crop)
    if (!croppedFile) {
      toast.error("Não foi possível recortar a imagem.")
      setIsProcessing(false)
      return
    }

    const compressionPromise = imageCompression(croppedFile, {
      maxSizeMB: 1.5,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
    })

    toast.promise(compressionPromise, {
      loading: 'Otimizando sua foto...',
      success: (compressedFile) => {
        onConfirm(compressedFile)
        return 'Foto pronta para o check-in!';
      },
      error: (err) => {
        console.error("Erro na compressão:", err)
        return 'Falha ao otimizar a imagem.'
      },
      finally: () => setIsProcessing(false)
    });
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="glass-card max-w-md mx-4 p-4 flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CropIcon className="h-5 w-5" />
            <span>Ajustar Foto</span>
          </DialogTitle>
          <DialogDescription>Selecione a área que deseja mostrar.</DialogDescription>
        </DialogHeader>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center my-4 min-h-[300px]">
          <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} minWidth={100}>
            <img ref={imgRef} src={imageToCrop} onLoad={onImageLoad} alt="Imagem para recortar" className="max-h-[60vh] object-contain" />
          </ReactCrop>
        </motion.div>
        <DialogFooter>
          <Button variant="outline" className="glass hover:bg-white/10" onClick={onCancel} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button className="glass hover:bg-white/20" onClick={handleConfirmCrop} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}