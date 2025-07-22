"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, Heart, MessageCircle, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const checkins = [
  {
    id: 1,
    user: "João Silva",
    avatar: "/placeholder.svg?height=40&width=40",
    image: "/placeholder.svg?height=300&width=400",
    time: "2 horas atrás",
    likes: 12,
    comments: 3,
    exercise: "Treino de Peito",
  },
  {
    id: 2,
    user: "Maria Santos",
    avatar: "/placeholder.svg?height=40&width=40",
    image: "/placeholder.svg?height=300&width=400",
    time: "4 horas atrás",
    likes: 8,
    comments: 1,
    exercise: "Corrida Matinal",
  },
  {
    id: 3,
    user: "Pedro Costa",
    avatar: "/placeholder.svg?height=40&width=40",
    image: "/placeholder.svg?height=300&width=400",
    time: "6 horas atrás",
    likes: 15,
    comments: 5,
    exercise: "Yoga e Meditação",
  },
]

export function CheckinsContent() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string>("")

  const userGroups = [
    { id: "1", name: "Academia Central", isActive: true },
    { id: "2", name: "Corrida Matinal", isActive: false },
    { id: "3", name: "Yoga & Mindfulness", isActive: false },
  ]

  const handleImageUpload = () => {
    // Simular upload de imagem
    console.log("Upload de imagem")
  }

  return (
    <div className="p-4 space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6">
        <h1 className="text-3xl font-bold">Check-ins</h1>
        <p className="text-muted-foreground mt-2">Compartilhe seu progresso</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Novo Check-in</span>
            </CardTitle>
            <CardDescription>Registre seu treino de hoje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-select">Selecionar Grupo *</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Escolha um grupo para fazer check-in" />
                </SelectTrigger>
                <SelectContent>
                  {userGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center space-x-2">
                        <span>{group.name}</span>
                        {group.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleImageUpload}
                variant="outline"
                className="glass hover:bg-white/10 h-20 flex-col space-y-2 bg-transparent"
                disabled={!selectedGroup}
              >
                <Camera className="h-6 w-6" />
                <span className="text-sm">Tirar Foto</span>
              </Button>
              <Button
                onClick={handleImageUpload}
                variant="outline"
                className="glass hover:bg-white/10 h-20 flex-col space-y-2 bg-transparent"
                disabled={!selectedGroup}
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Galeria</span>
              </Button>
            </div>

            {!selectedGroup && (
              <p className="text-sm text-muted-foreground text-center">Selecione um grupo para fazer check-in</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-4">
        {checkins.map((checkin, index) => (
          <motion.div
            key={checkin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
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
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{checkin.time}</span>
                      <span>•</span>
                      <span>Academia Central</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="glass">
                    {checkin.exercise}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={checkin.image || "/placeholder.svg"}
                    alt="Check-in"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="glass hover:bg-white/10">
                      <Heart className="h-4 w-4 mr-2" />
                      {checkin.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="glass hover:bg-white/10">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {checkin.comments}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
