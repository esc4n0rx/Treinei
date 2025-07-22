"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckinModal } from "@/components/checkin-modal"
import { GroupEmptyState } from "@/components/group-empty-state"
import { Camera, Heart, MessageCircle, Clock, Calendar, MapPin, Loader2, Building } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"


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

      {/* Stats do usuário */}
      {userStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary">{userStats.today}</p>
                  <p className="text-xs text-muted-foreground">Hoje</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-500">{userStats.weekly}</p>
                  <p className="text-xs text-muted-foreground">Esta Semana</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">{userStats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Botão de Check-in */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Button
          onClick={() => setCheckinModalOpen(true)}
          className="w-full glass hover:bg-white/20 h-16"
          disabled={!activeGroup || ((userStats?.today ?? 0) > 0)}
        >
          <Camera className="h-6 w-6 mr-3" />
          <div className="text-left">
            <p className="text-base font-medium">
              {(userStats?.today ?? 0) > 0 ? 'Check-in já realizado hoje!' : 'Fazer Check-in'}
            </p>
            <p className="text-sm opacity-75">
              {(userStats?.today ?? 0) > 0 ?  'Volte amanhã para um novo check-in' : 'Registre seu treino de hoje'}
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

      {/* Lista de Check-ins */}
      <div className="space-y-4">
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
              {/* Header */}
              <div className="p-4 pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={checkin.usuario?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {checkin.usuario?.nome
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{checkin.usuario?.nome || 'Usuário'}</p>
                      <Badge variant="secondary" className="glass text-xs">
                        Check-in
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatCheckinDate(checkin.data_checkin)}</span>
                      </div>
                      {checkin.local && (
                       <div className="flex items-center space-x-1">
                         <Building className="h-3 w-3" />
                         <span className="truncate max-w-[120px]">{checkin.local}</span>
                       </div>
                     )}
                     {checkin.grupo && (
                       <>
                         <span>•</span>
                         <div className="flex items-center space-x-1">
                           <MapPin className="h-3 w-3" />
                           <span className="truncate max-w-[100px]">{checkin.grupo.nome}</span>
                         </div>
                       </>
                     )}
                   </div>
                 </div>
               </div>
             </div>

             {/* Foto */}
             <div className="aspect-video bg-muted overflow-hidden">
               <img
                 src={checkin.foto_url}
                 alt="Check-in"
                 className="w-full h-full object-cover"
                 loading="lazy"
               />
             </div>

             {/* Conteúdo */}
             <div className="p-4">
               {checkin.observacao && (
                 <div className="mb-4">
                   <p className="text-sm text-foreground">{checkin.observacao}</p>
                 </div>
               )}

               <div className="flex items-center space-x-4">
                 <Button variant="ghost" size="sm" className="glass hover:bg-white/10 p-2">
                   <Heart className="h-4 w-4 mr-2" />
                   <span className="text-sm">Curtir</span>
                 </Button>
                 <Button variant="ghost" size="sm" className="glass hover:bg-white/10 p-2">
                   <MessageCircle className="h-4 w-4 mr-2" />
                   <span className="text-sm">Comentar</span>
                 </Button>
               </div>
             </div>
           </Card>
         </motion.div>
       ))}
     </div>

     <CheckinModal
       open={checkinModalOpen}
       onOpenChange={setCheckinModalOpen}
     />
   </div>
 )
}