"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Moon, Sun, Users, Trophy, Calendar, LogOut, Edit, Bell, Shield, Loader2, User as UserIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/hooks/useAuth"
import { EditProfileModal } from "@/components/edit-profile-modal" 

export function ProfileContent() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const { logout } = useAuth()
  const { profile, loading, error, refresh } = useProfile() 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false) 

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return "Data não disponível"
    
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long'
      })
    } catch (error) {
      return "Data inválida"
    }
  }

  const formatLastCheckin = (dateString?: string) => {
    if (!dateString) return "Nenhum check-in ainda"
    
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInMs = now.getTime() - date.getTime()
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
      
      if (diffInDays === 0) {
        return "Hoje"
      } else if (diffInDays === 1) {
        return "Ontem"
      } else if (diffInDays < 7) {
        return `${diffInDays} dias atrás`
      } else {
        return date.toLocaleDateString('pt-BR')
      }
    } catch (error) {
      return "Data inválida"
    }
  }

  if (loading && !profile) {
    return (
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <div className="flex justify-center items-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground">Carregando perfil...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erro ao carregar perfil</h3>
          <p className="text-muted-foreground">{error}</p>
        </motion.div>
      </div>
    )
  }

  const userStats = [
    { 
      label: "Check-ins Totais", 
      value: profile.checkins_totais.toString(), 
      icon: Calendar 
    },
    { 
      label: "Grupos", 
      value: profile.grupos_count.toString(), 
      icon: Users 
    },
    { 
      label: "Melhor Streak", 
      value: profile.melhor_streak.toString(), 
      icon: Trophy 
    },
  ]

  return (
    <>
      <div className="p-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || "/placeholder-user.jpg"} />
              <AvatarFallback className="text-2xl">
                {profile.nome
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <h1 className="text-2xl font-bold">{profile.nome}</h1>
          <p className="text-muted-foreground">
            Membro desde {formatMemberSince(profile.data_cadastro)}
          </p>
          <Badge variant="secondary" className="mt-2 glass">
            {profile.grupos_count > 0 ? "Membro Ativo" : "Novo Membro"}
          </Badge>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Estatísticas</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                {userStats.map((stat, index) => {
                  const Icon = stat.icon
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="space-y-2"
                    >
                      <Icon className="h-6 w-6 mx-auto text-primary" />
                      <p className="text-2xl font-bold text-primary">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atividade Recente */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Atividade</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">{profile.checkins_semanal}</p>
                  <p className="text-sm text-muted-foreground">Esta semana</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-500">{profile.checkins_mensal}</p>
                  <p className="text-sm text-muted-foreground">Este mês</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Último check-in:</p>
                <p className="text-sm text-muted-foreground">
                  {formatLastCheckin(profile.ultimo_checkin)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Grupos */}
        {profile.grupos && profile.grupos.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Seus Grupos</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.grupos.map((grupo, index) => (
                    <motion.div
                      key={grupo.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg glass hover:bg-white/10 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{grupo.nome}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {grupo.papel}
                        </p>
                      </div>
                      {grupo.papel === 'administrador' && (
                        <Badge variant="secondary" className="glass">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Configurações */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configurações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg glass">
                    {theme === "dark" ? (
                      <Moon className="h-4 w-4" />
                    ) : (
                      <Sun className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="theme-toggle" className="text-sm font-medium">
                      Tema escuro
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Alternar entre tema claro e escuro
                    </p>
                  </div>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={theme === "dark"}
                  onCheckedChange={(checked:any) => setTheme(checked ? "dark" : "light")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg glass">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Notificações</Label>
                    <p className="text-xs text-muted-foreground">
                      Receber notificações do app
                    </p>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>

              <Separator />

              <div className="space-y-3">
                <Button variant="outline" className="w-full glass hover:bg-white/10" onClick={() => setIsEditModalOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full glass hover:bg-red-600/20" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da Conta
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <EditProfileModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        userProfile={profile}
        onSuccess={refresh}
      />
    </>
  )
}