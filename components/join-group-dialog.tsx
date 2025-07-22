"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Lock, Users, Loader2 } from "lucide-react"
import { Group } from "@/types/group"
import { useGroups } from "@/hooks/useGroups"

interface JoinGroupDialogProps {
  group: Group | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JoinGroupDialog({ group, open, onOpenChange }: JoinGroupDialogProps) {
  const [senha, setSenha] = useState("")
  const { joinGroup, isJoining } = useGroups()

  const handleJoin = async () => {
    if (!group) return

    const result = await joinGroup({
      grupo_id: group.id,
      senha: group.tipo === 'privado' ? senha : undefined
    })

    if (result.success) {
      onOpenChange(false)
      setSenha("")
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setSenha("")
  }

  if (!group) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Entrar no Grupo</span>
          </DialogTitle>
          <DialogDescription>
            Confirme sua entrada no grupo abaixo
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-4"
        >
          <div className="flex items-center space-x-4 p-4 rounded-lg glass">
            <Avatar className="h-12 w-12">
              <AvatarImage src={group.logo_url || "/placeholder.svg"} />
              <AvatarFallback>
                {group.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold">{group.nome}</h3>
                {group.tipo === 'privado' && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              {group.descricao && (
                <p className="text-sm text-muted-foreground">{group.descricao}</p>
              )}
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary" className="glass text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {group._count?.membros || 0} membros
                </Badge>
                <Badge variant={group.tipo === 'publico' ? 'default' : 'outline'} className="glass text-xs">
                  {group.tipo === 'publico' ? 'Público' : 'Privado'}
                </Badge>
              </div>
            </div>
          </div>

          {group.tipo === 'privado' && (
            <div className="space-y-2">
              <Label htmlFor="senha">Senha do Grupo</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha do grupo"
                className="glass"
                disabled={isJoining}
              />
            </div>
          )}
        </motion.div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            className="glass hover:bg-white/10 bg-transparent"
            disabled={isJoining}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleJoin}
            className="glass hover:bg-white/20"
            disabled={isJoining || (group.tipo === 'privado' && !senha.trim())}
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar no Grupo"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}