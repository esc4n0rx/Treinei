"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Users, Trash2, UserMinus, Crown, Shield, Camera, Save, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Mock data
const groupData = {
  id: "1",
  name: "Academia Central",
  description: "Grupo da academia do centro da cidade",
  avatar: "/placeholder.svg?height=80&width=80",
  isPrivate: false,
  maxMembers: 50,
  weeklyGoal: 5,
}

const groupMembers = [
  {
    id: "1",
    name: "João Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "owner",
    joinedAt: "Janeiro 2024",
  },
  {
    id: "2",
    name: "Maria Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "admin",
    joinedAt: "Janeiro 2024",
  },
  {
    id: "3",
    name: "Pedro Costa",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    joinedAt: "Fevereiro 2024",
  },
  {
    id: "4",
    name: "Ana Lima",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "member",
    joinedAt: "Fevereiro 2024",
  },
]

export function ManageGroupContent({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("settings")
  const [formData, setFormData] = useState(groupData)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleSave = () => {
    // Aqui você salvaria as alterações
    console.log("Salvando alterações:", formData)
  }

  const handleDeleteGroup = () => {
    // Aqui você deletaria o grupo
    console.log("Deletando grupo:", id)
    router.push("/groups")
  }

  const handleRemoveMember = (memberId: string) => {
    console.log("Removendo membro:", memberId)
  }

  const handlePromoteMember = (memberId: string) => {
    console.log("Promovendo membro:", memberId)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />
      default:
        return null
    }
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Button asChild variant="ghost" size="sm" className="glass hover:bg-white/10">
          <Link href={`/groups/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Gerenciar Grupo</h1>
          <p className="text-muted-foreground">{formData.name}</p>
        </div>
        <Button onClick={handleSave} className="glass hover:bg-white/20">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="members">Membros</TabsTrigger>
            <TabsTrigger value="danger">Zona Perigosa</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Altere as informações do seu grupo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {formData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Grupo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="glass"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    className="glass min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Configurações do Grupo</CardTitle>
                <CardDescription>Defina as regras e limites</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="privacy">Grupo Privado</Label>
                    <p className="text-sm text-muted-foreground">Apenas membros convidados podem entrar</p>
                  </div>
                  <Switch
                    id="privacy"
                    checked={formData.isPrivate}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrivate: checked }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Limite de Membros</Label>
                  <Input
                    id="maxMembers"
                    type="number"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: Number.parseInt(e.target.value) }))}
                    className="glass"
                    min="2"
                    max="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weeklyGoal">Meta Semanal (check-ins por membro)</Label>
                  <Input
                    id="weeklyGoal"
                    type="number"
                    value={formData.weeklyGoal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weeklyGoal: Number.parseInt(e.target.value) }))}
                    className="glass"
                    min="1"
                    max="14"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6 mt-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gerenciar Membros</span>
                </CardTitle>
                <CardDescription>Gerencie permissões e membros do grupo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {groupMembers.map((member) => (
                    <div key={member.id} className="flex items-center space-x-4 p-3 rounded-lg glass">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{member.name}</p>
                          {getRoleIcon(member.role)}
                        </div>
                        <p className="text-sm text-muted-foreground">Desde {member.joinedAt}</p>
                      </div>

                      {member.role !== "owner" && (
                        <div className="flex space-x-2">
                          {member.role === "member" && (
                            <Button
                              onClick={() => handlePromoteMember(member.id)}
                              variant="outline"
                              size="sm"
                              className="glass hover:bg-white/10"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Promover
                            </Button>
                          )}
                          <Button
                            onClick={() => handleRemoveMember(member.id)}
                            variant="outline"
                            size="sm"
                            className="glass hover:bg-red-500/20 text-red-500"
                          >
                            <UserMinus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="danger" className="space-y-6 mt-6">
            <Card className="glass-card border-red-500/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Zona Perigosa</span>
                </CardTitle>
                <CardDescription>Ações irreversíveis que afetam permanentemente o grupo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <h4 className="font-semibold text-red-500 mb-2">Deletar Grupo</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esta ação não pode ser desfeita. Todos os dados do grupo, incluindo check-ins e histórico, serão
                    permanentemente removidos.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      onClick={() => setShowDeleteConfirm(true)}
                      variant="destructive"
                      className="glass hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Deletar Grupo
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-500">
                        Tem certeza? Digite o nome do grupo para confirmar:
                      </p>
                      <Input placeholder={formData.name} className="glass border-red-500/50" />
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setShowDeleteConfirm(false)}
                          variant="outline"
                          size="sm"
                          className="glass hover:bg-white/10"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleDeleteGroup}
                          variant="destructive"
                          size="sm"
                          className="glass hover:bg-red-500/20"
                        >
                          Confirmar Exclusão
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
