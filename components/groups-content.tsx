"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { JoinGroupDialog } from "@/components/join-group-dialog"
import { Users, Plus, Search, Settings, Crown, Calendar, TrendingUp, Globe, Lock } from "lucide-react"
import { useGroups } from "@/hooks/useGroups"
import { Group } from "@/types/group"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function GroupsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showPublicGroups, setShowPublicGroups] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [joinDialogOpen, setJoinDialogOpen] = useState(false)
  
  const { 
    groups, 
    activeGroup, 
    setActiveGroup, 
    loading,
    publicGroups,
    loadPublicGroups,
    loadingPublic
  } = useGroups()
  
  const router = useRouter()

  const filteredGroups = groups.filter(
    (group) =>
      group.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.descricao && group.descricao.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleSetActiveGroup = (group: Group) => {
    setActiveGroup(group)
  }

  const handleJoinGroup = (group: Group) => {
    setSelectedGroup(group)
    setJoinDialogOpen(true)
  }

  const handleSearchPublicGroups = async () => {
    setShowPublicGroups(true)
    await loadPublicGroups(searchQuery)
  }

  const handleBackToMyGroups = () => {
    setShowPublicGroups(false)
    setSearchQuery("")
  }

  if (loading) {
    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando grupos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold">
          {showPublicGroups ? 'Grupos Públicos' : 'Meus Grupos'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {showPublicGroups 
            ? 'Encontre novos grupos para se juntar' 
            : 'Gerencie seus grupos de treino'
          }
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={showPublicGroups ? "Buscar grupos públicos..." : "Buscar grupos..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          
          {!showPublicGroups && (
            <>
              <Button
                onClick={handleSearchPublicGroups}
                variant="outline"
                className="glass hover:bg-white/10 bg-transparent"
              >
                <Globe className="h-4 w-4 mr-2" />
                Públicos
              </Button>
              <Button asChild className="glass hover:bg-white/20">
                <Link href="/groups/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar
                </Link>
              </Button>
            </>
          )}

          {showPublicGroups && (
            <Button
              onClick={handleBackToMyGroups}
              variant="outline"
              className="glass hover:bg-white/10 bg-transparent"
            >
              Voltar
            </Button>
          )}
        </div>
      </motion.div>

      {showPublicGroups && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="flex space-x-2">
            <Button
              onClick={() => loadPublicGroups(searchQuery)}
              className="glass hover:bg-white/20"
              disabled={loadingPublic}
            >
              {loadingPublic ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-4">
        {!showPublicGroups && filteredGroups.length === 0 && searchQuery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground mb-4">Tente uma busca diferente</p>
          </motion.div>
        )}

        {!showPublicGroups && filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card
              className={`glass-card hover:scale-[1.02] transition-all duration-300 ${
                group.id === activeGroup?.id ? "ring-2 ring-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={group.logo_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {group.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{group.nome}</h3>
                      {group.administrador_id === group.administrador?.id && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                      {group.tipo === 'privado' && <Lock className="h-4 w-4 text-muted-foreground" />}
                      {group.id === activeGroup?.id && (
                        <Badge variant="default" className="glass">
                          Ativo
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{group.descricao}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{group._count?.membros || 0} membros</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(group.data_criacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <Badge variant={group.tipo === 'publico' ? 'default' : 'outline'} className="glass text-xs">
                        {group.tipo === 'publico' ? 'Público' : 'Privado'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  {group.id !== activeGroup?.id && (
                    <Button
                      onClick={() => handleSetActiveGroup(group)}
                      variant="outline"
                      size="sm"
                      className="glass hover:bg-white/10"
                    >
                      Ativar Grupo
                    </Button>
                  )}

                  <Button asChild variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                    <Link href={`/groups/${group.id}`}>Ver Detalhes</Link>
                  </Button>

                  {group.administrador_id === group.administrador?.id && (
                    <Button asChild variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                      <Link href={`/groups/${group.id}/manage`}>
                        <Settings className="h-3 w-3 mr-1" />
                        Gerenciar
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {showPublicGroups && publicGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
          >
            <Card className="glass-card hover:scale-[1.02] transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={group.logo_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {group.nome.split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{group.nome}</h3>
                      <Globe className="h-4 w-4 text-green-500" />
                    </div>

                    <p className="text-sm text-muted-foreground">{group.descricao}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{group._count?.membros || 0} membros</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(group.data_criacao).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {group.administrador && (
                        <div className="flex items-center space-x-1">
                          <Crown className="h-3 w-3" />
                          <span>{group.administrador.nome}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button
                    onClick={() => handleJoinGroup(group)}
                    className="glass hover:bg-white/20"
                    size="sm"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    Entrar no Grupo
                  </Button>

                  <Button asChild variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                    <Link href={`/groups/${group.id}`}>Ver Detalhes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {!showPublicGroups && filteredGroups.length === 0 && !searchQuery && groups.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
            <p className="text-muted-foreground mb-4">Você ainda não faz parte de nenhum grupo</p>
            <div className="flex justify-center space-x-2">
              <Button asChild className="glass hover:bg-white/20">
                <Link href="/groups/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Grupo
                </Link>
              </Button>
              <Button onClick={handleSearchPublicGroups} variant="outline" className="glass hover:bg-white/10 bg-transparent">
                <Search className="h-4 w-4 mr-2" />
                Encontrar Grupos
              </Button>
            </div>
          </motion.div>
        )}

        {showPublicGroups && publicGroups.length === 0 && !loadingPublic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Globe className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum grupo público encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Tente uma busca diferente' : 'Não há grupos públicos disponíveis no momento'}
            </p>
          </motion.div>
        )}

        {loadingPublic && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Buscando grupos...</p>
          </div>
        )}
      </div>

      <JoinGroupDialog
        group={selectedGroup}
        open={joinDialogOpen}
        onOpenChange={setJoinDialogOpen}
      />
    </div>
  )
}