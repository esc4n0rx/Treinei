"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Users, Lock, Globe, Camera } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

const groupCategories = [
  { id: "gym", label: "Academia", color: "bg-blue-500" },
  { id: "running", label: "Corrida", color: "bg-green-500" },
  { id: "yoga", label: "Yoga", color: "bg-purple-500" },
  { id: "cycling", label: "Ciclismo", color: "bg-orange-500" },
  { id: "swimming", label: "Natação", color: "bg-cyan-500" },
  { id: "martial-arts", label: "Artes Marciais", color: "bg-red-500" },
  { id: "dance", label: "Dança", color: "bg-pink-500" },
  { id: "other", label: "Outros", color: "bg-gray-500" },
]

export function CreateGroupContent() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    isPrivate: false,
    maxMembers: "",
    avatar: "",
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const router = useRouter()

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você faria a criação do grupo
    console.log("Criando grupo:", { ...formData, categories: selectedCategories })
    router.push("/groups")
  }

  const handleImageUpload = () => {
    // Simular upload de imagem
    console.log("Upload de avatar do grupo")
  }

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
        <div>
          <h1 className="text-2xl font-bold">Criar Novo Grupo</h1>
          <p className="text-muted-foreground">Configure seu grupo de treino</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Defina o nome e descrição do seu grupo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {formData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("") || "GR"}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  onClick={handleImageUpload}
                  variant="outline"
                  size="sm"
                  className="glass hover:bg-white/10 bg-transparent"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Alterar Foto
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nome do Grupo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Academia Central"
                  className="glass"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o objetivo e foco do seu grupo..."
                  className="glass min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Categorias</CardTitle>
              <CardDescription>Selecione as atividades do seu grupo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {groupCategories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all duration-300 ${
                      selectedCategories.includes(category.id)
                        ? "bg-primary/20 border-primary/50"
                        : "glass hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${category.color}`} />
                      <span className="text-sm font-medium">{category.label}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Defina as regras do seu grupo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {formData.isPrivate ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                  <div>
                    <Label htmlFor="privacy">Grupo Privado</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.isPrivate ? "Apenas por convite" : "Qualquer um pode entrar"}
                    </p>
                  </div>
                </div>
                <Switch
                  id="privacy"
                  checked={formData.isPrivate}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPrivate: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxMembers">Limite de Membros (opcional)</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData((prev) => ({ ...prev, maxMembers: e.target.value }))}
                  placeholder="Ex: 50"
                  className="glass"
                  min="2"
                  max="1000"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex space-x-4"
        >
          <Button type="button" variant="outline" className="flex-1 glass hover:bg-white/10 bg-transparent" asChild>
            <Link href="/groups">Cancelar</Link>
          </Button>
          <Button type="submit" className="flex-1 glass hover:bg-white/20" disabled={!formData.name.trim()}>
            <Users className="h-4 w-4 mr-2" />
            Criar Grupo
          </Button>
        </motion.div>
      </form>
    </div>
  )
}
