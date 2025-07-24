// components/checkin-modal.tsx
"use client"

import { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import dynamic from 'next/dynamic'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CameraInput } from "@/components/camera-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Loader2, MapPin, X, Building } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"
import { toast } from "sonner"

// Import dinâmico mais robusto para o novo ImageCropper
const ImageCropper = dynamic(
  () => import('./image-cropper').then(mod => {
    console.log('✅ Novo ImageCropper carregado')
    return mod.ImageCropper
  }),
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

  const [finalPhoto, setFinalPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [local, setLocal] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => formatDateForInput(new Date()));
  const [imageToCrop, setImageToCrop] = useState<string>("")

  const handleImageSelected = useCallback((file: File) => {
    console.log('🖼️ Nova imagem selecionada:', {
      name: file.name,
      size: file.size,
      type: file.type
    })
    
    // Validar se é uma imagem
    if (!file.type.startsWith('image/')) {
      console.error('❌ Arquivo não é uma imagem:', file.type)
      toast.error("Por favor,selecione um arquivo de imagem válido.")
      return
    }

    // Validar tamanho (máximo 10MB antes do processamento)
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ Arquivo muito grande:', file.size)
      toast.error("Imagem muito grande. Máximo 10MB.")
      return
    }
    
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      console.log('📸 Imagem convertida para base64:', {
        length: result.length,
        type: result.substring(0, 30),
        isValidDataUrl: result.startsWith('data:image/')
      })
      
      if (!result.startsWith('data:image/')) {
        console.error('❌ Base64 inválido gerado')
        toast.error("Erro ao processar a imagem.")
        return
      }
      
      setImageToCrop(result)
    }
    reader.onerror = (error) => {
      console.error('❌ Erro ao ler arquivo:', error)
      toast.error("Erro ao processar a imagem selecionada.")
    }
    reader.readAsDataURL(file)
  }, [])

  const handlePhotoRemove = useCallback(() => {
    setFinalPhoto(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  const handleCropConfirm = useCallback((file: File) => {
    console.log('✅ Crop confirmado:', file.name, file.size)
    setFinalPhoto(file)
    setPreviewUrl(URL.createObjectURL(file))
    setImageToCrop("")
  }, [])

  const handleCropCancel = useCallback(() => {
    console.log('❌ Crop cancelado')
    setImageToCrop("")
  }, [])

  const filteredSuggestions = useMemo(() =>
    suggestedLocations.filter(loc => loc.toLowerCase().includes(local.toLowerCase())),
    [local]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeGroup || !finalPhoto) {
      if (!finalPhoto) {
        toast.error("Por favor, adicione uma foto para o seu check-in.")
      }
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

  // Log de debug
  console.log('🔍 Estado do CheckinModal:', {
    imageToCrop: !!imageToCrop,
    imageToCropLength: imageToCrop.length,
    finalPhoto: !!finalPhoto,
    open
  })

  if (!activeGroup) {
    return null
  }

  return (
    <>
      {imageToCrop && (
        <ImageCropper
          key={imageToCrop.length} // Force re-render when image changes
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
                    alt="Preview do treino" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={handlePhotoRemove}
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="observacao" className="text-sm font-medium">Observação (opcional)</Label>
              <Textarea
                id="observacao"
                placeholder="Como foi seu treino? Compartilhe seus pensamentos..."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                className="glass bg-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="space-y-3 relative">
              <Label htmlFor="local" className="text-sm font-medium">Local (opcional)</Label>
              <Input
                id="local"
                placeholder="Onde você treinou?"
                value={local}
                onChange={(e) => {
                  setLocal(e.target.value)
                  setShowLocationSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowLocationSuggestions(local.length > 0)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                className="glass bg-transparent"
              />

              {showLocationSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-10 w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-lg mt-1 max-h-48 overflow-y-auto"
                >
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setLocal(suggestion)
                        setShowLocationSuggestions(false)
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg flex items-center space-x-2"
                    >
                      <Building className="h-4 w-4" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="datetime" className="text-sm font-medium">Data e Hora</Label>
              <div className="relative">
                <Input
                  id="datetime"
                  type="datetime-local"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="glass bg-transparent"
                />
                <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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