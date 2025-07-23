"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckinModal } from "@/components/checkin-modal"
import { CheckinActions } from "@/components/checkin-actions"
import { CommentDialog } from "@/components/comment-dialog"
import { GroupEmptyState } from "@/components/group-empty-state"
import { Camera, Clock, MapPin, Building, Loader2 } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"
import { CheckinComment } from "@/types/checkin"
import { toast } from "sonner"

const formatCheckinDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return diffInMinutes <= 0 ? 'Agora' : `${diffInMinutes}m atrás`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`
    } else {
      const day = String(date.getDate()).padStart(2, '0')
      const month = date.toLocaleDateString('pt-BR', { month: 'short' })
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day} de ${month} às ${hours}:${minutes}`
    }
  } catch (error) {
    return 'Data inválida'
  }
}

export function CheckinsContent() {
  const [checkinModalOpen, setCheckinModalOpen] = useState(false)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedCheckinId, setSelectedCheckinId] = useState<string | null>(null)
  const [checkinComments, setCheckinComments] = useState<{ [key: string]: CheckinComment[] }>({})
  const [loadingComments, setLoadingComments] = useState(false)
  
  const { activeGroup, hasGroups, loading: groupsLoading } = useGroups()
  const { 
    checkins, 
    loading: checkinsLoading, 
    userStats,
    loadGroupCheckins 
  } = useCheckins()

  useEffect(() => {
    if (activeGroup?.id) {
      loadGroupCheckins(activeGroup.id)
    }
  }, [activeGroup?.id, loadGroupCheckins])

  const handleLike = async (checkinId: string) => {
    try {
      const token = localStorage.getItem('treinei_token')
      const response = await fetch(`/api/checkins/${checkinId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success && activeGroup?.id) {
        // Recarregar checkins para atualizar contadores
        await loadGroupCheckins(activeGroup.id)
      } else {
        toast.error(result.error || 'Erro ao curtir check-in')
      }
    } catch (error) {
      toast.error('Erro de conexão ao curtir check-in')
    }
  }

  const handleComment = async (checkinId: string) => {
    setSelectedCheckinId(checkinId)
    setLoadingComments(true)
    
    try {
      const token = localStorage.getItem('treinei_token')
      const response = await fetch(`/api/checkins/${checkinId}/comments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()
      
      if (result.success && result.comments) {
        setCheckinComments(prev => ({
          ...prev,
          [checkinId]: result.comments
        }))
      }
    } catch (error) {
      toast.error('Erro ao carregar comentários')
    } finally {
      setLoadingComments(false)
      setCommentDialogOpen(true)
    }
  }

  const handleAddComment = async (checkinId: string, content: string) => {
    try {
      const token = localStorage.getItem('treinei_token')
      const response = await fetch(`/api/checkins/${checkinId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ conteudo: content })
      })

      const result = await response.json()
      
      if (result.success && result.comment) {
        // Atualizar comentários localmente
        setCheckinComments(prev => ({
          ...prev,
          [checkinId]: [...(prev[checkinId] || []), result.comment]
        }))
        
        // Recarregar checkins para atualizar contador
        if (activeGroup?.id) {
          await loadGroupCheckins(activeGroup.id)
        }
      } else {
        toast.error(result.error || 'Erro ao adicionar comentário')
      }
    } catch (error) {
      toast.error('Erro de conexão ao comentar')
    }
  }

  if (groupsLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!hasGroups) {
    return <GroupEmptyState />
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold">Check-ins</h1>
        <p className="text-muted-foreground mt-2">
          {activeGroup ? `Grupo: ${activeGroup.nome}` : 'Compartilhe seu progresso'}
        </p>
      </motion.div>

      {/* Stats do usuário - mais compacto */}
      {userStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{userStats.today}</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-500">{userStats.weekly}</p>
                  <p className="text-xs text-muted-foreground">Esta Semana</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-purple-500">{userStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Botão de Check-in - mais compacto */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={() => setCheckinModalOpen(true)}
          className="w-full glass hover:bg-white/20 h-12"
          disabled={!activeGroup || ((userStats?.today ?? 0) > 0)}
        >
          <Camera className="h-5 w-5 mr-2" />
          <div className="text-left">
            <p className="text-sm font-medium">
              {(userStats?.today ?? 0) > 0 ? 'Check-in já realizado hoje!' : 'Fazer Check-in'}
            </p>
          </div>
        </Button>
      </motion.div>

      {/* Loading dos check-ins */}
      {checkinsLoading && (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Carregando check-ins...</p>
        </div>
      )}

      {/* Lista de Check-ins - design mais compacto */}
      <div className="space-y-3">
        {!checkinsLoading && checkins.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <Camera className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum check-in ainda</h3>
            <p className="text-muted-foreground mb-4">
              Seja o primeiro a fazer check-in no grupo!
            </p>
          </motion.div>
        )}

        {checkins.map((checkin, index) => (
          <motion.div
            key={checkin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden">
              {/* Header compacto */}
              <div className="p-3 pb-2">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={checkin.usuario?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {checkin.usuario?.nome
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">{checkin.usuario?.nome || 'Usuário'}</p>
                      <Badge variant="secondary" className="glass text-xs px-1.5 py-0.5">
                        Check-in
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      <span>{formatCheckinDate(checkin.data_checkin)}</span>
                      {checkin.local && (
                        <>
                          <span>•</span>
                          <Building className="h-3 w-3" />
                          <span className="truncate max-w-[80px]">{checkin.local}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto com aspect ratio mais baixo */}
              <div className="aspect-[4/3] bg-muted overflow-hidden">
                <img
                  src={checkin.foto_url}
                  alt="Check-in"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Conteúdo */}
              <div className="p-3">
                {checkin.observacao && (
                  <div className="mb-3">
                    <p className="text-sm text-foreground line-clamp-2">{checkin.observacao}</p>
                  </div>
                )}

                <CheckinActions
                  checkinId={checkin.id}
                  likesCount={checkin._count?.curtidas || 0}
                  commentsCount={checkin._count?.comentarios || 0}
                  userLiked={checkin.userLiked || false}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <CheckinModal
        open={checkinModalOpen}
        onOpenChange={setCheckinModalOpen}
      />

      <CommentDialog
        open={commentDialogOpen}
        onOpenChange={setCommentDialogOpen}
        checkinId={selectedCheckinId || ''}
        comments={selectedCheckinId ? checkinComments[selectedCheckinId] || [] : []}
        onAddComment={handleAddComment}
        loading={loadingComments}
      />
    </div>
  )
}