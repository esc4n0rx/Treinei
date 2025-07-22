// components/group-details-content.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Settings, UserPlus, Crown, Clock, Loader2 } from "lucide-react"
import { fetchGroupById } from "@/lib/api/groups"
import { Group } from "@/types/group"
import Link from "next/link"

const recentActivity = [
  { id: "1", user: "Maria Santos", action: "fez check-in", time: "2h atrás", type: "checkin" },
  { id: "2", user: "Pedro Costa", action: "entrou no grupo", time: "1 dia atrás", type: "join" },
  { id: "3", user: "João Silva", action: "fez check-in", time: "1 dia atrás", type: "checkin" },
  { id: "4", user: "Ana Lima", action: "fez check-in", time: "2 dias atrás", type: "checkin" },
]

export function GroupDetailsContent({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("overview")
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGroup = async () => {
      try {
        setLoading(true)
        const result = await fetchGroupById(id)
        
        if (result.success && result.group) {
          setGroup(result.group)
        } else {
          setError(result.error || 'Grupo não encontrado')
        }
      } catch (err) {
        setError('Erro ao carregar grupo')
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [id])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrador":
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Settings className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrador":
      case "owner":
        return (
          <Badge variant="secondary" className="glass text-xs">
            Administrador
          </Badge>
        )
      case "admin":
        return (
          <Badge variant="secondary" className="glass text-xs">
            Admin
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando grupo...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild variant="outline" className="glass hover:bg-white/10">
            <Link href="/groups">Voltar aos Grupos</Link>
          </Button>
        </div>
      </div>
    )
  }

  const isOwner = group.userMembership?.role === 'administrador'
  const membersCount = group.membros?.length || 0

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button asChild variant="ghost" size="sm" className="glass hover:bg-white/10">
          <Link href="/groups">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{group.nome}</h1>
          <p className="text-muted-foreground">Detalhes do grupo</p>
        </div>
        {isOwner && (
          <Button asChild variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
            <Link href={`/groups/${id}/manage`}>
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar
            </Link>
          </Button>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={group.logo_url || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {group.nome
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="text-xl font-semibold">{group.nome}</h2>
                  <p className="text-muted-foreground text-sm">{group.descricao}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant={group.tipo === 'publico' ? 'default' : 'outline'} className="glass">
                    {group.tipo === 'publico' ? 'Público' : 'Privado'}
                  </Badge>
                  {group.max_membros && (
                    <Badge variant="outline" className="glass">
                      Limite: {group.max_membros}
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-primary">{membersCount}</p>
                    <p className="text-xs text-muted-foreground">Membros</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-500">--</p>
                    <p className="text-xs text-muted-foreground">Check-ins/semana</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-500">--</p>
                    <p className="text-xs text-muted-foreground">Meta semanal</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="activity">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Estatísticas da Semana</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Progresso da Meta</span>
                    <span className="text-sm font-medium">-- / --</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '0%' }} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Funcionalidade em desenvolvimento
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Informações do Grupo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{new Date(group.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span>{group.tipo === 'publico' ? 'Público' : 'Privado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seu papel:</span>
                  <span>{isOwner ? 'Administrador' : 'Membro'}</span>
                </div>
                {group.max_membros && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Limite de membros:</span>
                    <span>{group.max_membros}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4 mt-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Membros ({membersCount})</h3>
              {isOwner && (
                <Button size="sm" className="glass hover:bg-white/20">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {group.membros?.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.usuario?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>
                            {member.usuario?.nome
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium">{member.usuario?.nome}</p>
                            {getRoleIcon(member.papel)}
                            {getRoleBadge(member.papel)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>-- check-ins esta semana</span>
                            <span>Desde {new Date(member.data_entrada).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">Atividade Recente</h3>

            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            activity.type === "checkin" ? "bg-green-500" : "bg-blue-500"
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span> {activity.action}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{activity.time}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}