// components/manage-group-content.tsx
"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Users, Trash2, UserMinus, Crown, Shield, Camera, Save, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Group, GroupMember } from "@/types/group"
import { fetchGroupById, updateGroupApi, removeMemberApi, updateMemberRoleApi } from "@/lib/api/groups"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"


export function ManageGroupContent({ id }: { id: string }) {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("settings")
  const [group, setGroup] = useState<Group | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    maxMembers: 50,
    weeklyGoal: 5,
  })
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [confirmDeleteText, setConfirmDeleteText] = useState("")

  useEffect(() => {
    const loadGroup = async () => {
      setLoading(true)
      const result = await fetchGroupById(id)
      if (result.success && result.group) {
        setGroup(result.group)
        setFormData({
          name: result.group.nome,
          description: result.group.descricao || "",
          isPrivate: result.group.tipo === 'privado',
          maxMembers: result.group.max_membros || 50,
          weeklyGoal: 5, // Placeholder for now
        })
        setMembers(result.group.membros || [])
      } else {
        toast.error("Falha ao carregar dados do grupo.")
        router.push("/groups")
      }
      setLoading(false)
    }
    loadGroup()
  }, [id, router])

  const handleSave = async () => {
  setIsSaving(true)
  const result = await updateGroupApi(id, {
    nome: formData.name,
    descricao: formData.description,
    isPrivate: formData.isPrivate,
    max_membros: formData.maxMembers,
  })
  if (result.success) {
    toast.success("Grupo atualizado com sucesso!")
    setGroup(prev => prev ? { ...prev, ...result.group } : result.group ?? null)
  } else {
    toast.error(result.error || "Falha ao salvar alterações.")
  }
  setIsSaving(false)
}

  const handleDeleteGroup = () => {
    console.log("Deletando grupo:", id)
    toast.info("Funcionalidade de deletar grupo em desenvolvimento.")
    router.push("/groups")
  }

  const handleRemoveMember = async (memberId: string) => {
    setDeletingMemberId(memberId);
    const result = await removeMemberApi(id, memberId)
    if (result.success) {
      toast.success("Membro removido com sucesso!")
      setMembers(prev => prev.filter(m => m.usuario_id !== memberId))
    } else {
      toast.error(result.error || "Falha ao remover membro.")
    }
    setDeletingMemberId(null);
  }

  const handleToggleAdmin = async (member: GroupMember) => {
    const newRole = member.papel === 'administrador' ? 'membro' : 'administrador'
    const result = await updateMemberRoleApi(id, member.usuario_id, { role: newRole })

    if (result.success) {
      toast.success(`Cargo de ${member.usuario?.nome} atualizado para ${newRole}.`)
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, papel: newRole } : m))
    } else {
      toast.error(result.error || 'Falha ao alterar cargo.')
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "administrador": return <Crown className="h-4 w-4 text-yellow-500" />
      default: return null
    }
  }

  if (loading) {
    return <div className="p-4 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
  }

  return (
    <div className="p-4 space-y-6 pb-20">
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
        <Button onClick={handleSave} className="glass hover:bg-white/20" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {isSaving ? "" : "Salvar"}
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="settings">Configurações</TabsTrigger>
            <TabsTrigger value="members">Membros ({members.length})</TabsTrigger>
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
                    <AvatarImage src={group?.logo_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {formData.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="glass hover:bg-white/10 bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Grupo</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} className="glass" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} className="glass min-h-[100px]" />
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
                  <Switch id="privacy" checked={formData.isPrivate} onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrivate: checked }))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxMembers">Limite de Membros</Label>
                  <Input id="maxMembers" type="number" value={formData.maxMembers} onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: Number.parseInt(e.target.value, 10) }))} className="glass" min="2" max="1000" />
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
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-4 p-3 rounded-lg glass">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.usuario?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>
                          {member.usuario?.nome.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{member.usuario?.nome}</p>
                          {getRoleIcon(member.papel)}
                        </div>
                        <p className="text-sm text-muted-foreground">Desde {new Date(member.data_entrada).toLocaleDateString('pt-BR')}</p>
                      </div>

                      {member.usuario_id !== user?.id && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleToggleAdmin(member)}
                            variant="outline" size="sm" className="glass hover:bg-white/10">
                            <Shield className="h-3 w-3 mr-1" />
                            {member.papel === 'administrador' ? 'Rebaixar' : 'Promover'}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="icon" className="glass hover:bg-red-500/20 text-red-500 w-9 h-9">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover {member.usuario?.nome}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O usuário será removido permanentemente do grupo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveMember(member.usuario_id)} disabled={deletingMemberId === member.usuario_id}>
                                  {deletingMemberId === member.usuario_id ? <Loader2 className="h-4 w-4 animate-spin"/> : "Confirmar"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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
                <CardTitle className="flex items-center space-x-2 text-red-500"><AlertTriangle className="h-5 w-5" /><span>Zona Perigosa</span></CardTitle>
                <CardDescription>Ações irreversíveis que afetam permanentemente o grupo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="glass hover:bg-red-500/20">
                      <Trash2 className="h-4 w-4 mr-2" /> Deletar Grupo
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação é irreversível. Todos os dados do grupo serão perdidos.
                        Para confirmar, digite <strong>{group?.nome}</strong> abaixo.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Input placeholder={group?.nome} className="glass border-red-500/50" value={confirmDeleteText} onChange={(e) => setConfirmDeleteText(e.target.value)} />
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteGroup} disabled={confirmDeleteText !== group?.nome}>
                        Confirmar Exclusão
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}