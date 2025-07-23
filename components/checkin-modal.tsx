"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CameraInput } from "@/components/camera-input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Loader2, MapPin, X, Building } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"

interface CheckinModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Lista de locais sugeridos para facilitar preenchimento
const suggestedLocations = [
  "Academia",
  "Parque",
  "Casa",
  "Rua/Corrida",
  "Praia",
  "Clube",
  "Estúdio",
  "Quadra"
]

// Função utilitária para formatar data para input datetime-local
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

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [observacao, setObservacao] = useState("")
  const [local, setLocal] = useState("")
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false)
  
  // CORREÇÃO: Inicializa o estado com a data e hora local do dispositivo, sem ajustes manuais de fuso horário.
  // O objeto `new Date()` já contém a informação correta do timezone do browser.
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return formatDateForInput(now);
  });

  const handlePhotoCapture = (file: File) => {
    setSelectedPhoto(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handlePhotoRemove = () => {
    setSelectedPhoto(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleLocationSelect = (selectedLocation: string) => {
    setLocal(selectedLocation)
    setShowLocationSuggestions(false)
  }

  const filteredSuggestions = suggestedLocations.filter(location =>
    location.toLowerCase().includes(local.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activeGroup || !selectedPhoto) {
      return
    }

    const result = await createCheckin({
      grupo_id: activeGroup.id,
      foto: selectedPhoto,
      observacao: observacao.trim() || undefined,
      local: local.trim() || undefined,
      data_checkin: new Date(selectedDate).toISOString()
    })

    if (result.success) {
      // Reset form
      setSelectedPhoto(null)
      setPreviewUrl(null)
      setObservacao("")
      setLocal("")
      // CORREÇÃO: Reseta o estado para a data e hora local atual após o envio.
      setSelectedDate(() => {
        const now = new Date();
        return formatDateForInput(now);
      });
      onOpenChange(false)
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      handlePhotoRemove()
      setObservacao("")
      setLocal("")
      setShowLocationSuggestions(false)
      onOpenChange(false)
    }
  }

  if (!activeGroup) {
    return null
  }

  return (
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
          {/* Grupo Info */}
          <div className="flex items-center space-x-3 p-3 rounded-lg glass">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activeGroup.logo_url || "/placeholder.svg"} />
              <AvatarFallback>
                {activeGroup.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{activeGroup.nome}</p>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Check-in de hoje</span>
              </div>
            </div>
          </div>

          {/* Foto */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Foto do Treino *</Label>
            
            {!selectedPhoto ? (
              <CameraInput
                onPhotoCapture={handlePhotoCapture}
                onPhotoRemove={handlePhotoRemove}
                disabled={isCreating}
              />
            ) : (
              <div className="relative">
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={previewUrl || ""}
                    alt="Preview do check-in"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={handlePhotoRemove}
                  disabled={isCreating}
                  className="absolute -top-2 -right-2 rounded-full w-8 h-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Local */}
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
                  // Delay para permitir clique nas sugestões
                  setTimeout(() => setShowLocationSuggestions(false), 200)
                }}
                placeholder="Ex: Academia, Parque, Casa..."
                className="pl-10 glass"
                disabled={isCreating}
                maxLength={50}
              />
            </div>
            
            {/* Sugestões de localização */}
            {showLocationSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 z-10 mt-1 bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-lg max-h-32 overflow-y-auto"
              >
                {filteredSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => handleLocationSelect(suggestion)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Opcional • {local.length}/50 caracteres
            </p>
          </div>

          {/* Data e Hora */}
          <div className="space-y-2">
            <Label htmlFor="datetime" className="text-sm font-medium">
              Data e Hora
            </Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="datetime"
                type="datetime-local"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 glass"
                disabled={isCreating}
                max={formatDateForInput(new Date())}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Seu fuso horário local será usado.
            </p>
          </div>

          {/* Observação */}
          <div className="space-y-2">
            <Label htmlFor="observacao" className="text-sm font-medium">
              Observação (opcional)
            </Label>
            <Textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Como foi seu treino hoje? Que exercícios fez?"
              className="glass min-h-[80px] resize-none"
              maxLength={500}
              disabled={isCreating}
            />
            <p className="text-xs text-muted-foreground">
              {observacao.length}/500 caracteres
            </p>
          </div>

          {/* Botões */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1 glass hover:bg-white/10 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedPhoto || isCreating}
              className="flex-1 glass hover:bg-white/20"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Fazer Check-in"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}