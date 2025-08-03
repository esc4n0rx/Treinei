"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createGroupApi } from "@/lib/api/groups"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Info, Settings, Globe, Lock, Loader2, Upload, X } from "lucide-react"

const groupCategories = [
  { id: "fitness", label: "Fitness", color: "bg-red-500" },
  { id: "musculacao", label: "Musculação", color: "bg-blue-500" },
  { id: "cardio", label: "Cardio", color: "bg-green-500" },
  { id: "yoga", label: "Yoga", color: "bg-purple-500" },
  { id: "crossfit", label: "CrossFit", color: "bg-orange-500" },
  { id: "corrida", label: "Corrida", color: "bg-yellow-500" },
]

interface FormData {
  nome: string
  descricao: string
  tipo: "publico" | "privado"
  senha: string
  max_membros: string
}

export function CreateGroupContent() {
  const [isMounted, setIsMounted] = useState(false)
  const { isAuthenticated, loading: authLoading } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState("info")
  const [isCreating, setIsCreating] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    descricao: "",
    tipo: "publico",
    senha: "",
    max_membros: "",
  })


  useEffect(() => {
    setIsMounted(true)
  }, [])


  useEffect(() => {
    if (isMounted && !authLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isMounted, isAuthenticated, authLoading, router])


  if (!isMounted || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 5MB.")
        return
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor selecione uma imagem.")
        return
      }
      setSelectedFile(file)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast.error("Nome do grupo é obrigatório")
      return
    }

    if (formData.tipo === 'privado' && !formData.senha.trim()) {
      toast.error("Senha é obrigatória para grupos privados")
      return
    }

    setIsCreating(true)

    const result = await createGroupApi({
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

    setIsCreating(false)
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
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Criando...
              </>
            ) : (
              "Criar Grupo"
            )}
          </Button>
        </motion.div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        <form id="create-group-form" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 glass">
                <TabsTrigger value="info" className="flex items-center space-x-2">
                  {getTabIcon("info")}
                  <span>Informações</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  {getTabIcon("settings")}
                  <span>Configurações</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Info className="h-5 w-5" />
                      <span>Informações Básicas</span>
                    </CardTitle>
                    <CardDescription>
                      Configure as informações principais do seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Grupo *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Academia Central"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="glass"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva o objetivo do seu grupo..."
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        className="glass resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Logo do Grupo</Label>
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : "/placeholder.svg"} 
                          />
                          <AvatarFallback className="text-lg">
                            {formData.nome
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .toUpperCase() || "GR"}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="glass hover:bg-white/10"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              Escolher Imagem
                            </Button>
                            
                            {selectedFile && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFile(null)}
                                className="glass hover:bg-red-500/20"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          
                          <p className="text-xs text-muted-foreground mt-1">
                            Formatos: JPG, PNG, GIF. Máximo: 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Categorias (Opcional)</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {groupCategories.map((category) => (
                          <Button
                            key={category.id}
                            type="button"
                            variant={selectedCategories.includes(category.id) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCategoryToggle(category.id)}
                            className="justify-start glass"
                          >
                            <div className={`w-3 h-3 rounded-full ${category.color} mr-2`} />
                            {category.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Configurações de Privacidade</span>
                    </CardTitle>
                    <CardDescription>
                      Defina quem pode acessar o seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Grupo Público</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Qualquer pessoa pode encontrar e entrar no grupo
                          </p>
                        </div>
                        <Switch
                          checked={formData.tipo === "publico"}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              tipo: checked ? "publico" : "privado",
                              senha: checked ? "" : prev.senha
                            }))
                          }
                        />
                      </div>

                      {formData.tipo === "privado" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-4 border-t pt-4"
                        >
                          <div className="flex items-center space-x-2 text-orange-400">
                            <Lock className="h-4 w-4" />
                            <span className="font-medium">Grupo Privado</span>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="senha">Senha de Acesso *</Label>
                            <Input
                              id="senha"
                              type="password"
                              placeholder="Digite uma senha forte"
                              value={formData.senha}
                              onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                              className="glass"
                              required={formData.tipo === "privado"}
                            />
                            <p className="text-xs text-muted-foreground">
                              Será necessária para novos membros entrarem no grupo
                            </p>
                          </div>
                        </motion.div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="max_membros">Limite de Membros (Opcional)</Label>
                        <Input
                          id="max_membros"
                          type="number"
                          placeholder="Ex: 50"
                          min="2"
                          max="1000"
                          value={formData.max_membros}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_membros: e.target.value }))}
                          className="glass"
                        />
                        <p className="text-xs text-muted-foreground">
                          Deixe em branco para permitir membros ilimitados
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