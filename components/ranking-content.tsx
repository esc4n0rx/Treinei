"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Calendar, TrendingUp, Loader2, Users } from "lucide-react"
import { useRanking } from "@/hooks/useRanking"
import { useGroups } from "@/hooks/useGroups"
import { useAuth } from "@/hooks/useAuth"

export function RankingContent() {
  const [period, setPeriod] = useState<"weekly" | "monthly">("weekly")
  const { user } = useAuth()
  const { activeGroup } = useGroups()
  const { weeklyRanking, monthlyRanking, loading, error } = useRanking(activeGroup?.id)

  const ranking = period === "weekly" ? weeklyRanking : monthlyRanking
  const userPosition = ranking?.user_position

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>
    }
  }

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-500/20 to-orange-500/20 border-yellow-500/30"
      case 2:
        return "from-gray-400/20 to-gray-600/20 border-gray-400/30"
      case 3:
        return "from-amber-600/20 to-amber-800/20 border-amber-600/30"
      default:
        return "from-muted/20 to-muted/40 border-muted/30"
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted-foreground mt-2">Veja quem está liderando</p>
        </motion.div>
        
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando ranking...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted-foreground mt-2">Veja quem está liderando</p>
        </motion.div>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar ranking</h3>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Empty state
  if (!ranking || ranking.usuarios.length === 0) {
    return (
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <h1 className="text-3xl font-bold">Ranking</h1>
          <p className="text-muted-foreground mt-2">Veja quem está liderando</p>
          </motion.div>
        
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum check-in encontrado</h3>
            <p className="text-muted-foreground">
              Seja o primeiro a fazer check-in neste {period === "weekly" ? "semana" : "mês"}!
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold">Ranking</h1>
        <p className="text-muted-foreground mt-2">
          {activeGroup?.nome || "Grupo"} - {period === "weekly" ? "Esta semana" : "Este mês"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-2"
      >
        <Button
          onClick={() => setPeriod("weekly")}
          variant={period === "weekly" ? "default" : "outline"}
          className={`flex-1 glass ${period === "weekly" ? "bg-primary" : "hover:bg-white/10"}`}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Semanal
        </Button>
        <Button
          onClick={() => setPeriod("monthly")}
          variant={period === "monthly" ? "default" : "outline"}
          className={`flex-1 glass ${period === "monthly" ? "bg-primary" : "hover:bg-white/10"}`}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Mensal
        </Button>
      </motion.div>

      <div className="space-y-3">
        {ranking.usuarios.map((usuario, index) => (
          <motion.div
            key={`${period}-${usuario.id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card
              className={`glass-card bg-gradient-to-r ${getPositionColor(usuario.posicao)} hover:scale-[1.02] transition-all duration-300 ${
                usuario.id === user?.id ? 'ring-2 ring-primary/50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12">
                    {getPositionIcon(usuario.posicao)}
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={usuario.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback>
                      {usuario.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold">{usuario.nome}</p>
                      {usuario.id === user?.id && (
                        <Badge variant="secondary" className="text-xs">
                          Você
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {usuario.checkins_count} check-in{usuario.checkins_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary" className="glass text-lg px-3 py-1">
                    {usuario.checkins_count}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Suas Estatísticas */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Suas Estatísticas</span>
            </CardTitle>
            <CardDescription>Seu desempenho no período</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">
                  {userPosition ? `${userPosition.posicao}º` : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Posição</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {userPosition ? userPosition.checkins_count : 0}
                </p>
                <p className="text-sm text-muted-foreground">Check-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}