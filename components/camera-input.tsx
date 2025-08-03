
"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera, Upload, RotateCcw, Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CameraInputProps {
  onImageSelected: (file: File) => void
  disabled?: boolean
  className?: string
}

export function CameraInput({
  onImageSelected,
  disabled = false,
  className
}: CameraInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [isVideoReady, setIsVideoReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
      }
      const constraints = { video: { facingMode: { ideal: mode }, aspectRatio: { ideal: 4 / 3 } } }
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)
      setFacingMode(mode)
      setIsVideoReady(false)
      setIsOpen(true)
      return true
    } catch (error: unknown) {
      console.error(`Erro ao acessar câmera com facingMode: ${mode}`, error)
      return false
    }
  }, [stream])

  useEffect(() => {
    if (stream && videoRef.current && isOpen) {
      const video = videoRef.current
      const handleLoadedMetadata = () => {
        setIsVideoReady(true)
        video.play().catch(e => console.error('Erro ao reproduzir vídeo:', e))
      }
      video.srcObject = stream
      video.addEventListener('loadedmetadata', handleLoadedMetadata)
      return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [stream, isOpen])

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [stream])

  const handleCameraOpen = async () => {
    const success = await startCamera('environment')
    if (!success) {
      const fallbackSuccess = await startCamera('user')
      if (!fallbackSuccess) {
        toast.error('Não foi possível acessar a câmera. Verifique as permissões.')
      }
    }
  }

  const stopCamera = () => {
    stream?.getTracks().forEach(track => track.stop())
    setStream(null)
    setIsOpen(false)
    setCapturedPhoto(null)
    setIsVideoReady(false)
  }

  const switchCamera = () => startCamera(facingMode === 'user' ? 'environment' : 'user')

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || !isVideoReady) return
    const context = canvas.getContext('2d')
    if (!context) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)
    setCapturedPhoto(canvas.toDataURL('image/jpeg', 0.95))
  }

  const confirmPhoto = async () => {
    if (!capturedPhoto) return
    setIsProcessing(true)
    try {
      const blob = await fetch(capturedPhoto).then(res => res.blob())
      const file = new File([blob], `checkin-${Date.now()}.jpg`, { type: 'image/jpeg' })
      onImageSelected(file)
      stopCamera()
    } catch (error) {
      toast.error('Erro ao processar a foto.')
    } finally {
      setIsProcessing(false)
    }
  }

  const retakePhoto = () => setCapturedPhoto(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido.")
        return
      }
      onImageSelected(file)
    }
    if (e.target) e.target.value = ''
  }

  const openGallery = () => fileInputRef.current?.click()

  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col h-full">
        <div className="flex justify-end p-2">
          <Button onClick={stopCamera} variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full">
            <X className="h-6 w-6" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <div className="w-full aspect-[3/4] max-h-full relative">
            {!capturedPhoto ? (
              <>
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" style={{ opacity: isVideoReady ? 1 : 0 }} />
                <canvas ref={canvasRef} className="hidden" />
                {!isVideoReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </>
            ) : (
              <img src={capturedPhoto} alt="Foto capturada" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
        <div className="flex items-center justify-around p-4 h-28">
          {!capturedPhoto ? (
            <>
              <Button onClick={switchCamera} variant="ghost" size="lg" className="text-white hover:bg-white/20 rounded-full w-16 h-16" disabled={!isVideoReady}>
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button onClick={capturePhoto} size="lg" className="rounded-full w-20 h-20 bg-white hover:bg-white/90 ring-4 ring-white/30" disabled={!isVideoReady}>
                <Camera className="h-8 w-8 text-black" />
              </Button>
              <div className="w-16" />
            </>
          ) : (
            <>
              <Button onClick={retakePhoto} variant="ghost" size="lg" className="text-white hover:bg-white/20 rounded-full w-16 h-16" disabled={isProcessing}>
                <RotateCcw className="h-6 w-6" />
              </Button>
              <Button onClick={confirmPhoto} size="lg" className="rounded-full w-20 h-20 bg-green-500 hover:bg-green-600 ring-4 ring-green-500/30" disabled={isProcessing}>
                {isProcessing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Check className="h-8 w-8 text-white" />}
              </Button>
              <div className="w-16" />
            </>
          )}
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
        <Button onClick={handleCameraOpen} variant="outline" className="glass hover:bg-white/10 h-16 flex-col space-y-2 bg-transparent" disabled={disabled}>
          <Camera className="h-6 w-6" />
          <span className="text-sm">Câmera</span>
        </Button>
        <Button onClick={openGallery} variant="outline" className="glass hover:bg-white/10 h-16 flex-col space-y-2 bg-transparent" disabled={disabled}>
          <Upload className="h-6 w-6" />
          <span className="text-sm">Galeria</span>
        </Button>
      </div>
    </div>
  )
}