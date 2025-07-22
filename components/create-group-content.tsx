// components/create-group-content.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileInput } from "@/components/ui/file-input"
import { ArrowLeft, Users, Lock, Globe, Settings, Info, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useGroups } from "@/hooks/useGroups"
import { toast } from "sonner"
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
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    tipo: "publico" as "publico" | "privado",
    senha: "",
    max_membros: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  
  const router = useRouter()
  const { createGroup, isCreating } = useGroups()

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.nome.trim()) {
      toast.error("Nome do grupo é obrigatório")
      setActiveTab("info")
      return false
    }

    if (formData.tipo === 'privado' && !formData.senha.trim()) {
      toast.error("Senha é obrigatória para grupos privados")
      setActiveTab("settings")
      return false
    }

    if (formData.max_membros && (parseInt(formData.max_membros) < 2 || parseInt(formData.max_membros) > 1000)) {
      toast.error("Limite de membros deve ser entre 2 e 1000")
      setActiveTab("settings")
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    console.log('Dados do formulário:', {
      ...formData,
      selectedFile: selectedFile ? { name: selectedFile.name, size: selectedFile.size } : null
    })

    const result = await createGroup({
      nome: formData.nome.trim(),
      descricao: formData.descricao.trim() || undefined,
      tipo: formData.tipo,
      senha: formData.tipo === 'privado' ? formData.senha.trim() : undefined,
      max_membros: formData.max_membros ? parseInt(formData.max_membros) : undefined,
      logo: selectedFile || undefined
    })

    if (result.success) {
      toast.success("Grupo criado com sucesso!")
      router.push("/groups")
    }
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "info": return <Info className="h-4 w-4" />
      case "settings": return <Settings className="h-4 w-4" />
      default: return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-card border-b">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4"
        >
          <div className="flex items-center space-x-3">
            <Button asChild variant="ghost" size="sm" className="glass hover:bg-white/10">
              <Link href="/groups">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-bold">Novo Grupo</h1>
              <p className="text-xs text-muted-foreground">Configure seu grupo</p>
            </div>
          </div>
          <Button 
            type="submit" 
            form="create-group-form"
            size="sm"
            className="glass hover:bg-white/20" 
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Criar"
            )}
          </Button>
        </motion.div>
      </div>

      {/* Form */}
      <div className="p-4 pb-20">
        <form id="create-group-form" onSubmit={handleSubmit}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass mb-6">
                <TabsTrigger value="info" className="flex items-center space-x-2">
                  {getTabIcon("info")}
                  <span className="hidden sm:inline">Informações</span>
                  <span className="sm:hidden">Info</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  {getTabIcon("settings")}
                  <span className="hidden sm:inline">Configurações</span>
                  <span className="sm:hidden">Config</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                {/* Foto e Nome */}
                <Card className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <FileInput
                        value={selectedFile}
                        onChange={handleFileChange}
                        preview={previewUrl}
                        fallback={formData.nome
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "GR"}
                        disabled={isCreating}
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor="name" className="text-sm">Nome do Grupo *</Label>
                          <Input
                            id="name"
                            value={formData.nome}
                            onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Academia Central"
                            className="glass mt-1"
                            required
                            disabled={isCreating}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Descrição */}
                <Card className="glass-card">
                  <CardContent className="p-4 space-y-3">
                    <Label htmlFor="description" className="text-sm">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.descricao}
                      onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o objetivo do seu grupo..."
                      className="glass min-h-[80px] resize-none"
                      disabled={isCreating}
                    />
                  </CardContent>
                </Card>

                {/* Categorias */}
                <Card className="glass-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Categorias</CardTitle>
                    <CardDescription className="text-xs">Selecione as atividades (opcional)</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {groupCategories.map((category) => (
                        <motion.div
                          key={category.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => !isCreating && handleCategoryToggle(category.id)}
                          className={`p-2 rounded-md border cursor-pointer transition-all duration-300 ${
                            selectedCategories.includes(category.id)
                              ? "bg-primary/20 border-primary/50"
                              : "glass hover:bg-white/10"
                          } ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${category.color}`} />
                            <span className="text-xs font-medium">{category.label}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                {/* Privacidade */}
                <Card className="glass-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {formData.tipo === 'privado' ? <Lock className="h-5 w-5" /> : <Globe className="h-5 w-5" />}
                        <div>
                          <Label htmlFor="privacy" className="text-sm">Grupo Privado</Label>
                          <p className="text-xs text-muted-foreground">
                            {formData.tipo === 'privado' ? "Requer senha para entrar" : "Qualquer um pode entrar"}
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="privacy"
                        checked={formData.tipo === 'privado'}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({ 
                            ...prev, 
                            tipo: checked ? 'privado' : 'publico',
                            senha: checked ? prev.senha : ""
                          }))
                        }}
                        disabled={isCreating}
                      />
                    </div>

                    {formData.tipo === 'privado' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-2"
                      >
                        <Label htmlFor="password" className="text-sm">Senha do Grupo *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.senha}
                          onChange={(e) => setFormData((prev) => ({ ...prev, senha: e.target.value }))}
                          placeholder="Digite uma senha"
                          className="glass"
                          required={formData.tipo === 'privado'}
                          disabled={isCreating}
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                {/* Limite de Membros */}
                <Card className="glass-card">
                  <CardContent className="p-4 space-y-3">
                    <Label htmlFor="maxMembers" className="text-sm">Limite de Membros</Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      value={formData.max_membros}
                      onChange={(e) => setFormData((prev) => ({ ...prev, max_membros: e.target.value }))}
                      placeholder="Ex: 50 (opcional)"
                      className="glass"
                      min="2"
                      max="1000"
                      disabled={isCreating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Deixe em branco para sem limite
                    </p>
                  </CardContent>
                </Card>

                {/* Info sobre criação */}
                <Card className="glass-card border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Você será o administrador</p>
                        <p className="text-xs text-muted-foreground">
                          Como criador, você poderá gerenciar membros, alterar configurações e excluir o grupo.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </form>
      </div>
    </div>
  )
}