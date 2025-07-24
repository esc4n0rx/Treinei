// components/group-details-content.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Trophy, Settings, Users, Crown, Clock, Loader2, Info } from "lucide-react"
import { fetchGroupById } from "@/lib/api/groups"
import { Group } from "@/types/group"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"

export function GroupDetailsContent({ id }: { id: string }) {
  const [activeTab, setActiveTab] = useState("members")
  const [group, setGroup] = useState<Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth();

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

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "administrador":
        return (
          <Badge variant="secondary" className="glass text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Crown className="h-3 w-3 mr-1" />
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

  const isOwner = user?.id === group.administrador?.id;
  const membersCount = group.membros?.length || 0

  return (
    <div className="p-4 space-y-6 pb-20">
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
          <h1 className="text-2xl font-bold truncate">{group.nome}</h1>
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
            <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
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
                      {membersCount} / {group.max_membros} membros
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="members">Membros ({membersCount})</TabsTrigger>
            <TabsTrigger value="info">Informações</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4 mt-6">
            <div className="space-y-3">
              {group.membros?.sort((a,b) => a.papel === 'administrador' ? -1 : 1).map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Link href={`/users/${member.usuario_id}`}>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.usuario?.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback>
                              {member.usuario?.nome
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link href={`/users/${member.usuario_id}`} className="font-medium text-sm hover:underline">{member.usuario?.nome}</Link>
                            {getRoleBadge(member.papel)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Na equipe desde {new Date(member.data_entrada).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info" className="space-y-4 mt-6">
             <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2"><Info className="h-5 w-5" /><span>Sobre o Grupo</span></CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Administrador:</span>
                  <span className="font-medium">{group.administrador?.nome || 'Não definido'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>{new Date(group.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <span className="capitalize">{group.tipo}</span>
                </div>
                 {group.userMembership?.joinedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Você entrou em:</span>
                    <span>{new Date(group.userMembership.joinedAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}