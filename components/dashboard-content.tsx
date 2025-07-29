"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Target, TrendingUp, Building } from "lucide-react"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Button } from "@/components/ui/button"
import { GroupEmptyState } from "@/components/group-empty-state"
import { useGroups } from "@/hooks/useGroups"
import { useCheckins } from "@/hooks/useCheckins"
import Link from "next/link"

// Função utilitária para formatar tempo de check-in
const formatCheckinTime = (dateString: string): string => {
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
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${day}/${month} às ${hours}:${minutes}`
    }
  } catch (error) {
    return 'Data inválida'
  }
}

export function DashboardContent() {
  const { hasGroups, activeGroup, loading } = useGroups()
  const { 
    checkins, 
    userStats,
    loadGroupCheckins,
    loading: checkinsLoading 
  } = useCheckins()

  useEffect(() => {
    if (activeGroup?.id) {
      loadGroupCheckins(activeGroup.id)
    }
  }, [activeGroup?.id, loadGroupCheckins])

  // Mostrar loading enquanto carrega os grupos
  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não tem grupos, mostrar empty state
  if (!hasGroups) {
    return <GroupEmptyState />
  }

  const stats = [
    { 
      title: "Check-ins Hoje", 
      value: userStats?.today.toString() || "0", 
      icon: Calendar, 
      color: "text-blue-500" 
    },
    { 
      title: "Esta Semana", 
      value: userStats?.weekly.toString() || "0", 
      icon: Target, 
      color: "text-green-500" 
    },
    { 
      title: "Total", 
      value: userStats?.total.toString() || "0", 
      icon: TrendingUp, 
      color: "text-purple-500" 
    },
    { 
      title: "Membros", 
      value: activeGroup?._count?.membros?.toString() || "0", 
      icon: Users, 
      color: "text-orange-500" 
    },
  ]

  // Pegar apenas os 3 check-ins mais recentes para o dashboard
  const recentCheckins = checkins.slice(0, 3)

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Bem-vindo de volta! {activeGroup?.nome || 'Grupo Desconhecido'}
        </h1>
        <p className="text-muted-foreground mt-2">Continue sua jornada fitness</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Grupo Ativo</p>
                  <p className="text-sm text-muted-foreground">
                    {activeGroup?.nome || 'Nenhum grupo selecionado'}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                <Link href="/groups">Trocar Grupo</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.1 }}
            >
              <Card className="glass-card hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Check-ins Recentes</span>
              </div>
              {checkins.length > 0 && (
                <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-white/10">
                  <Link href="/checkins">Ver Todos</Link>
                </Button>
              )}
            </CardTitle>
            <CardDescription>Atividade do seu grupo</CardDescription>
          </CardHeader>
          <CardContent>
            {checkinsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Carregando check-ins...</p>
              </div>
            ) : recentCheckins.length > 0 ? (
              <div className="space-y-4">
                {recentCheckins.map((checkin, index) => (
                  <motion.div
                    key={checkin.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex items-center space-x-3 p-3 rounded-lg glass hover:bg-white/5 transition-all duration-300"
                  >
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
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="font-medium truncate">{checkin.usuario?.nome || 'Usuário'}</p>
                        {checkin.local && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Building className="h-3 w-3" />
                            <span className="truncate max-w-[60px]">{checkin.local}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{formatCheckinTime(checkin.data_checkin)}</p>
                    </div>
                    {checkin.observacao && (
                      <div className="text-xs text-muted-foreground max-w-[100px] truncate">
                        "{checkin.observacao}"
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">Nenhum check-in ainda</p>
                <p className="text-xs text-muted-foreground">
                  Seja o primeiro a fazer check-in no grupo!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <FloatingActionButton />
    </div>
  )
}