"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Users, Plus, Search, Settings, Crown, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const userGroups = [
  {
    id: "1",
    name: "Academia Central",
    description: "Grupo da academia do centro da cidade",
    members: 15,
    isOwner: true,
    isActive: true,
    avatar: "/placeholder.svg?height=60&width=60",
    weeklyCheckins: 42,
    lastActivity: "2h atrás",
  },
  {
    id: "2",
    name: "Corrida Matinal",
    description: "Pessoal que corre de manhã no parque",
    members: 8,
    isOwner: false,
    isActive: false,
    avatar: "/placeholder.svg?height=60&width=60",
    weeklyCheckins: 28,
    lastActivity: "1 dia atrás",
  },
  {
    id: "3",
    name: "Yoga & Mindfulness",
    description: "Grupo focado em yoga e meditação",
    members: 12,
    isOwner: false,
    isActive: false,
    avatar: "/placeholder.svg?height=60&width=60",
    weeklyCheckins: 18,
    lastActivity: "3h atrás",
  },
]

export function GroupsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeGroupId, setActiveGroupId] = useState("1")
  const router = useRouter()

  const filteredGroups = userGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSetActiveGroup = (groupId: string) => {
    setActiveGroupId(groupId)
    // Aqui você salvaria no localStorage ou estado global
    localStorage.setItem("activeGroupId", groupId)
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold">Meus Grupos</h1>
        <p className="text-muted-foreground mt-2">Gerencie seus grupos de treino</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass"
            />
          </div>
          <Button asChild className="glass hover:bg-white/20">
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Link>
          </Button>
        </div>
      </motion.div>

      <div className="space-y-4">
        {filteredGroups.map((group, index) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card
              className={`glass-card hover:scale-[1.02] transition-all duration-300 ${
                group.id === activeGroupId ? "ring-2 ring-primary/50 bg-primary/5" : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={group.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {group.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{group.name}</h3>
                      {group.isOwner && <Crown className="h-4 w-4 text-yellow-500" />}
                      {group.id === activeGroupId && (
                        <Badge variant="default" className="glass">
                          Ativo
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">{group.description}</p>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{group.members} membros</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{group.weeklyCheckins} check-ins/semana</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{group.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  {group.id !== activeGroupId && (
                    <Button
                      onClick={() => handleSetActiveGroup(group.id)}
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

                  {group.isOwner && (
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
      </div>

      {filteredGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-12"
        >
          <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum grupo encontrado</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Tente uma busca diferente" : "Você ainda não faz parte de nenhum grupo"}
          </p>
          <Button asChild className="glass hover:bg-white/20">
            <Link href="/groups/create">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Grupo
            </Link>
          </Button>
        </motion.div>
      )}
    </div>
  )
}
