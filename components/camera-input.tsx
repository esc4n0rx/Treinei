"use client"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, RotateCcw, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CameraInputProps {
  onPhotoCapture: (file: File) => void
  onPhotoRemove: () => void
  disabled?: boolean
  className?: string
}

export function CameraInput({ 
  onPhotoCapture, 
  onPhotoRemove, 
  disabled = false, 
  className 
}: CameraInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    // Parar qualquer stream existente
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }

    const constraints = {
      video: { 
        facingMode: { ideal: mode },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setFacingMode(mode)
      setIsOpen(true)
    } catch (error) {
      console.error(`Erro ao acessar câmera com facingMode: ${mode}`, error)
      return false
    }
    return true
  }, [stream])


  const handleCameraOpen = async () => {
    // Tenta primeiro a câmera traseira, se falhar, tenta a frontal.
    const success = await startCamera('environment')
    if (!success) {
      const fallbackSuccess = await startCamera('user')
      if (!fallbackSuccess) {
        toast.error('Não foi possível acessar a câmera. Verifique as permissões e tente usar a galeria.')
      }
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    setIsOpen(false)
    setCapturedPhoto(null)
  }

  const switchCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    startCamera(newFacingMode)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0)
    
    const dataURL = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedPhoto(dataURL)
  }

  const confirmPhoto = () => {
    if (!capturedPhoto) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `checkin-${Date.now()}.jpg`, {
          type: 'image/jpeg'
        })
        onPhotoCapture(file)
        stopCamera()
      }
    }, 'image/jpeg', 0.9)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onPhotoCapture(file)
    } else if (file) {
      toast.error("Por favor, selecione um arquivo de imagem válido.")
    }
  }

  const openGallery = () => {
    fileInputRef.current?.click()
  }

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex-1 relative">
          {!capturedPhoto ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </>
          ) : (
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full object-contain"
            />
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-md">
          <Button
            onClick={stopCamera}
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/20 rounded-full p-3"
          >
            <X className="h-6 w-6" />
          </Button>

          <div className="flex items-center space-x-4">
            {!capturedPhoto ? (
              <>
                <Button
                  onClick={switchCamera}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20 rounded-full p-3"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="rounded-full w-16 h-16 bg-white hover:bg-white/90"
                >
                  <Camera className="h-8 w-8 text-black" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20 rounded-full p-3"
                >
                  <RotateCcw className="h-6 w-6" />
                </Button>
                <Button
                  onClick={confirmPhoto}
                  size="lg"
                  className="rounded-full w-16 h-16 bg-green-500 hover:bg-green-600"
                >
                  <Check className="h-8 w-8 text-white" />
                </Button>
              </>
            )}
          </div>

          <div className="w-12" /> {/* Spacer */}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={handleCameraOpen}
          variant="outline"
          className="glass hover:bg-white/10 h-16 flex-col space-y-2 bg-transparent"
          disabled={disabled}
        >
          <Camera className="h-6 w-6" />
          <span className="text-sm">Câmera</span>
        </Button>

        <Button
          onClick={openGallery}
          variant="outline"
          className="glass hover:bg-white/10 h-16 flex-col space-y-2 bg-transparent"
          disabled={disabled}
        >
          <Upload className="h-6 w-6" />
          <span className="text-sm">Galeria</span>
        </Button>
      </div>
    </div>
  )
}