"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, User, Camera, Save } from "lucide-react"
import { toast } from "sonner"
import { UserProfile } from "@/types/profile"
import { updateUserProfileApi } from "@/lib/api/profile"

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userProfile: UserProfile | null
  onSuccess: () => void
}

export function EditProfileModal({ open, onOpenChange, userProfile, onSuccess }: EditProfileModalProps) {
  const [name, setName] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.nome)
      setPreviewUrl(userProfile.avatar_url || null)
    }
  }, [userProfile])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.")
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem.")
        return
      }
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!userProfile || !name.trim()) {
      toast.error("O nome é obrigatório.")
      return
    }

    setIsSaving(true)

    try {
      let avatarUrl = userProfile.avatar_url;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        const token = localStorage.getItem('treinei_token');
        const uploadResponse = await fetch('/api/upload/avatar', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData,
        });

        const uploadResult = await uploadResponse.json();
        
        if (!uploadResult.success) {
            throw new Error(uploadResult.error || "Falha no upload da imagem.");
        }
        avatarUrl = uploadResult.url;
      }
      
      const result = await updateUserProfileApi({
        nome: name.trim(),
        avatar_url: avatarUrl || undefined,
      });


      if (result.success) {
        toast.success("Perfil atualizado com sucesso!");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(result.error || "Não foi possível atualizar o perfil.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocorreu um erro desconhecido.");
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize seu nome e sua foto de perfil.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 py-4"
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || "/placeholder-user.jpg"} />
                <AvatarFallback className="text-3xl">
                  {name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="absolute bottom-0 right-0 rounded-full glass hover:bg-white/20"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-4 w-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="pl-10 glass"
                disabled={isSaving}
              />
            </div>
          </div>
        </motion.div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="glass hover:bg-white/10 bg-transparent"
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="glass hover:bg-white/20"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}