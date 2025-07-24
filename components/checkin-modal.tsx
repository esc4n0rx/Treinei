// components/checkin-modal.tsx
"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CameraInput } from "@/components/camera-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Loader2, MapPin, X, Building, Crop as CropIcon } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"
import { toast } from "sonner"
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from "browser-image-compression"

interface CheckinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const suggestedLocations = ["Academia", "Parque", "Casa", "Rua/Corrida", "Praia", "Clube", "Estúdio", "Quadra"]

const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
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

export function CheckinModal({ open, onOpenChange }: CheckinModalProps) {
  const { activeGroup } = useGroups()
  const { createCheckin, isCreating } = useCheckins()

  const [finalPhoto, setFinalPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [local, setLocal] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(new Date()));

  // Cropper States
  const [imageToCrop, setImageToCrop] = useState<string>("")
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [crop, setCrop] = useState<Crop>()
  const imgRef = useRef<HTMLImageElement | null>(null)

  const handleImageSelected = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      setImageToCrop(reader.result as string)
      setIsCropperOpen(true)
    }
    reader.readAsDataURL(file)
  }

  const handlePhotoRemove = () => {
    setFinalPhoto(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleLocationSelect = (selectedLocation: string) => {
    setLocal(selectedLocation)
    setShowLocationSuggestions(false)
  }

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const initialCrop = centerCrop(
      makeAspectCrop({ unit: '%', width: 90 }, 1, width, height),
      width, height
    )
    setCrop(initialCrop)
  }

  const handleConfirmCrop = async () => {
    if (!imgRef.current || !crop || !crop.width || !crop.height) {
      toast.error("Recorte inválido.")
      return
    }

    const croppedFile = await getCroppedImg(imgRef.current, crop)
    if (!croppedFile) {
      toast.error("Não foi possível recortar a imagem.")
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
        setFinalPhoto(compressedFile);
        setPreviewUrl(URL.createObjectURL(compressedFile));
        setIsCropperOpen(false);
        setImageToCrop("");
        return 'Foto pronta para o check-in!';
      },
      error: 'Falha ao otimizar a imagem.',
    });
  }

  const filteredSuggestions = suggestedLocations.filter(loc => loc.toLowerCase().includes(local.toLowerCase()))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGroup || !finalPhoto) return

    const result = await createCheckin({
      grupo_id: activeGroup.id,
      foto: finalPhoto,
      observacao: observacao.trim() || undefined,
      local: local.trim() || undefined,
      data_checkin: new Date(selectedDate).toISOString()
    })

    if (result.success) {
      handleClose(false)
    }
  }

  const handleClose = (isOpen: boolean) => {
    if (isCreating || isCropperOpen) return
    if (!isOpen) {
      setFinalPhoto(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setObservacao("")
      setLocal("")
      setSelectedDate(formatDateForInput(new Date()))
    }
    onOpenChange(isOpen)
  }

  if (!activeGroup) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="glass-card max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Novo Check-in</span>
            </DialogTitle>
            <DialogDescription>Registre seu treino em <strong>{activeGroup.nome}</strong></DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 p-3 rounded-lg glass">
              <Avatar className="h-10 w-10">
                <AvatarImage src={activeGroup.logo_url || "/placeholder.svg"} />
                <AvatarFallback>{activeGroup.nome.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{activeGroup.nome}</p>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span>Check-in de hoje</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Foto do Treino *</Label>
              {!finalPhoto ? (
                <CameraInput onImageSelected={handleImageSelected} disabled={isCreating} />
              ) : (
                <div className="relative">
                  <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                    <img src={previewUrl || ""} alt="Preview do check-in" className="w-full h-full object-cover" />
                  </div>
                  <Button type="button" variant="destructive" size="sm" onClick={handlePhotoRemove} disabled={isCreating} className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="space-y-2 relative">
            <Label htmlFor="local" className="text-sm font-medium">
              Local do Treino
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="local"
                value={local}
                onChange={(e) => {
                  setLocal(e.target.value)
                  setShowLocationSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowLocationSuggestions(local.length > 0)}
                onBlur={() => {
                  setTimeout(() => setShowLocationSuggestions(false), 200)
                }}
                placeholder="Ex: Academia, Parque, Casa..."
                className="pl-10 glass"
                disabled={isCreating}
                maxLength={50}
              />
            </div>
            {showLocationSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => handleLocationSelect(suggestion)} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            <p className="text-xs text-muted-foreground">Opcional • {local.length}/50 caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="datetime" className="text-sm font-medium">Data e Hora</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input id="datetime" type="datetime-local" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="pl-10 glass" disabled={isCreating} max={formatDateForInput(new Date())} />
            </div>
            <p className="text-xs text-muted-foreground">Seu fuso horário local será usado.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacao" className="text-sm font-medium">Observação (opcional)</Label>
            <Textarea id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Como foi seu treino hoje?" className="glass min-h-[80px] resize-none" maxLength={500} disabled={isCreating} />
            <p className="text-xs text-muted-foreground">{observacao.length}/500 caracteres</p>
          </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => handleClose(false)} disabled={isCreating} className="flex-1 glass hover:bg-white/10 bg-transparent">
                Cancelar
              </Button>
              <Button type="submit" disabled={!finalPhoto || isCreating} className="flex-1 glass hover:bg-white/20">
                {isCreating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando...</> : "Fazer Check-in"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="glass-card max-w-md mx-4 p-4 flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CropIcon className="h-5 w-5" />
              <span>Ajustar Foto</span>
            </DialogTitle>
            <DialogDescription>Selecione a área que deseja mostrar.</DialogDescription>
          </DialogHeader>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center my-4 min-h-[300px]">
            {imageToCrop && (
              <ReactCrop crop={crop} onChange={c => setCrop(c)} aspect={1} minWidth={100}>
                <img ref={imgRef} src={imageToCrop} onLoad={onImageLoad} alt="Imagem para recortar" className="max-h-[60vh] object-contain" />
              </ReactCrop>
            )}
          </motion.div>
          <DialogFooter>
            <Button variant="outline" className="glass hover:bg-white/10" onClick={() => setIsCropperOpen(false)}>Cancelar</Button>
            <Button className="glass hover:bg-white/20" onClick={handleConfirmCrop}>Confirmar Recorte</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}