"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Target, TrendingUp } from "lucide-react"
import { FloatingActionButton } from "@/components/floating-action-button"
import { Button } from "@/components/ui/button"
import { GroupEmptyState } from "@/components/group-empty-state"
import { useGroups } from "@/hooks/useGroups"
import Link from "next/link"

const recentCheckins = [
  { id: 1, user: "João Silva", time: "2h atrás", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 2, user: "Maria Santos", time: "4h atrás", avatar: "/placeholder.svg?height=40&width=40" },
  { id: 3, user: "Pedro Costa", time: "6h atrás", avatar: "/placeholder.svg?height=40&width=40" },
]

const stats = [
  { title: "Check-ins Hoje", value: "3", icon: Calendar, color: "text-blue-500" },
  { title: "Membros Ativos", value: "12", icon: Users, color: "text-green-500" },
  { title: "Meta Semanal", value: "85%", icon: Target, color: "text-purple-500" },
  { title: "Progresso", value: "+15%", icon: TrendingUp, color: "text-orange-500" },
]

export function DashboardContent() {
  const { hasGroups, activeGroup, loading } = useGroups()

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

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Bem-vindo de volta!
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + 0.1 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Check-ins Recentes</span>
            </CardTitle>
            <CardDescription>Atividade do seu grupo hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCheckins.map((checkin, index) => (
              <motion.div
                key={checkin.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 + 0.1 }}
                className="flex items-center space-x-3 p-3 rounded-lg glass hover:bg-white/5 transition-all duration-300"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={checkin.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {checkin.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{checkin.user}</p>
                  <p className="text-sm text-muted-foreground">{checkin.time}</p>
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      <FloatingActionButton />
    </div>
  )
}