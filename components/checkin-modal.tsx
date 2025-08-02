// components/checkin-modal.tsx
"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CameraInput } from "@/components/camera-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Loader2, MapPin, X, Building, Navigation } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"
import { useGeolocation } from "@/hooks/useGeolocation"
import { toast } from "sonner"

// Import dinâmico mais simples
const ImageCropper = dynamic(
  () => import('./image-cropper').then(mod => mod.ImageCropper),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2"/>
          <p>Carregando editor...</p>
        </div>
      </div>
    )
  }
)

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

export function CheckinModal({ open, onOpenChange }: CheckinModalProps) {
  const { activeGroup } = useGroups()
  const { createCheckin, isCreating } = useCheckins()
  const { permissionState, getLocationString, getCurrentLocation } = useGeolocation()

  const [finalPhoto, setFinalPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [local, setLocal] = useState("")
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(new Date()))
  const [imageToCrop, setImageToCrop] = useState<string>("")

  // Carregar localização automaticamente quando o modal abrir
  useEffect(() => {
    const loadCurrentLocation = async () => {
      if (open && permissionState.granted && !local) {
        setIsLoadingLocation(true)
        try {
          const locationString = await getLocationString()
          if (locationString) {
            setLocal(locationString)
          }
        } catch (error) {
          console.error('Erro ao obter localização:', error)
        } finally {
          setIsLoadingLocation(false)
        }
      }
    }

    loadCurrentLocation()
  }, [open, permissionState.granted, getLocationString, local])

  const handleImageSelected = useCallback((file: File) => {
    console.log('🖼️ Nova imagem selecionada:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione um arquivo de imagem válido.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 10MB.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataURL = e.target?.result as string
      setImageToCrop(dataURL)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleCropConfirm = useCallback((croppedFile: File) => {
    console.log('✅ Imagem cortada confirmada:', {
      name: croppedFile.name,
      size: croppedFile.size,
      type: croppedFile.type
    })
    
    setFinalPhoto(croppedFile)
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    
    const newPreviewUrl = URL.createObjectURL(croppedFile)
    setPreviewUrl(newPreviewUrl)
    setImageToCrop("")
  }, [previewUrl])

  const handleCropCancel = useCallback(() => {
    setImageToCrop("")
  }, [])

  const handleLocationRefresh = async () => {
    if (!permissionState.granted) {
      toast.error("Permissão de localização não concedida")
      return
    }

    setIsLoadingLocation(true)
    try {
      const locationString = await getLocationString()
      if (locationString) {
        setLocal(locationString)
        toast.success("Localização atualizada!")
      } else {
        toast.error("Não foi possível obter a localização")
      }
    } catch (error) {
      console.error('Erro ao atualizar localização:', error)
      toast.error("Erro ao obter localização")
    } finally {
      setIsLoadingLocation(false)
    }
  }

  const filteredSuggestions = useMemo(() => {
    return suggestedLocations.filter(suggestion =>
      suggestion.toLowerCase().includes(local.toLowerCase())
    )
  }, [local])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!finalPhoto) {
      toast.error("Adicione uma foto do seu treino")
      return
    }

    if (!activeGroup) {
      toast.error("Selecione um grupo")
      return
    }

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
    if (isCreating) return
    if (!isOpen) {
      setFinalPhoto(null)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setObservacao("")
      setLocal("")
      setSelectedDate(formatDateForInput(new Date()))
      setImageToCrop("")
    }
    onOpenChange(isOpen)
  }

  if (!activeGroup) {
    return null
  }

  return (
    <>
      {imageToCrop && (
        <ImageCropper
          imageToCrop={imageToCrop}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="glass-card max-w-md mx-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Novo Check-in</span>
            </DialogTitle>
            <DialogDescription>
              Registre seu treino em <strong>{activeGroup.nome}</strong>
            </DialogDescription>
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
                <CameraInput onImageSelected={handleImageSelected} />
              ) : (
                <div className="relative">
                  <img
                    src={previewUrl || ""}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setFinalPhoto(null)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="local" className="text-sm font-medium">
                Localização
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  id="local"
                  value={local}
                  onChange={(e) => {
                    setLocal(e.target.value)
                    setShowLocationSuggestions(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowLocationSuggestions(local.length > 0)}
                  onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                  placeholder={isLoadingLocation ? "Obtendo localização..." : "Digite ou deixe em branco para usar GPS"}
                  className="pl-10 pr-10 glass"
                  disabled={isLoadingLocation}
                />
                
                {/* Botão de refresh da localização */}
                {permissionState.granted && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-8 w-8 p-0"
                    onClick={handleLocationRefresh}
                    disabled={isLoadingLocation}
                  >
                    {isLoadingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                  </Button>
                )}

                {/* Sugestões de localização */}
                {showLocationSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-32 overflow-y-auto">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                        onClick={() => {
                          setLocal(suggestion)
                          setShowLocationSuggestions(false)
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Aviso se permissão não foi concedida */}
              {!permissionState.granted && !permissionState.loading && (
                <p className="text-xs text-muted-foreground">
                  💡 Para preenchimento automático, habilite a localização nas configurações do navegador
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="observacao" className="text-sm font-medium">
                Observação (opcional)
              </Label>
              <Textarea
                id="observacao"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Como foi seu treino hoje?"
                className="min-h-[80px] glass resize-none"
                maxLength={280}
              />
              <div className="text-xs text-muted-foreground text-right">
                {observacao.length}/280
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="data" className="text-sm font-medium">
                Data e Hora
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="data"
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 glass"
                  max={formatDateForInput(new Date())}
                />
              </div>
            </div>

            <Button
              type="submit"
             className="w-full glass hover:bg-white/10 transition-all duration-300"
             disabled={isCreating || !finalPhoto}
           >
             {isCreating ? (
               <>
                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                 Publicando...
               </>
             ) : (
               <>
                 <Calendar className="mr-2 h-4 w-4" />
                 Fazer Check-in
               </>
             )}
           </Button>
         </form>
       </DialogContent>
     </Dialog>
   </>
 )
}