"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Moon, Sun, Users, Trophy, Calendar, LogOut, Edit, Bell, Shield } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

const userStats = [
  { label: "Check-ins Totais", value: "127", icon: Calendar },
  { label: "Grupos", value: "3", icon: Users },
  { label: "Conquistas", value: "8", icon: Trophy },
]

export function ProfileContent() {
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <Avatar className="h-24 w-24 mx-auto mb-4 ring-4 ring-primary/20">
            <AvatarImage src="/placeholder.svg?height=96&width=96" />
            <AvatarFallback className="text-2xl">JS</AvatarFallback>
          </Avatar>
        </motion.div>
        <h1 className="text-2xl font-bold">João Silva</h1>
        <p className="text-muted-foreground">Membro desde Janeiro 2024</p>
        <Badge variant="secondary" className="mt-2 glass">
          Fitness Enthusiast
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <Icon className="h-6 w-6 mx-auto text-primary" />
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configurações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                <Label htmlFor="theme-toggle">Tema Escuro</Label>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5" />
                <Label htmlFor="notifications">Notificações</Label>
              </div>
              <Switch id="notifications" defaultChecked />
            </div>

            <Separator />

            <Button variant="ghost" className="w-full justify-start glass hover:bg-white/10">
              <Edit className="h-4 w-4 mr-3" />
              Editar Perfil
            </Button>

            <Button variant="ghost" className="w-full justify-start glass hover:bg-white/10">
              <Users className="h-4 w-4 mr-3" />
              Gerenciar Grupos
            </Button>

            <Button variant="ghost" className="w-full justify-start glass hover:bg-white/10">
              <Shield className="h-4 w-4 mr-3" />
              Privacidade
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Button onClick={handleLogout} variant="destructive" className="w-full glass hover:bg-red-500/20">
          <LogOut className="h-4 w-4 mr-2" />
          Sair da Conta
        </Button>
      </motion.div>
    </div>
  )
}
