"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  const [mounted, setMounted] = useState(false)
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

  // Verificar se o componente foi montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Não renderizar nada até que o componente seja montado no cliente
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ?
        prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const handleFileChange = (file: File | null) => {
  if (file) {
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem')
      return
    }
    
    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }
    
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  } else {
    setPreviewUrl(null)
  }
  
  setSelectedFile(file)
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
                        placeholder="Ex: Treino da Galera"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        maxLength={50}
                        className="glass bg-white/5"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Máximo 50 caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        placeholder="Descreva o objetivo do seu grupo..."
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        maxLength={200}
                        className="glass bg-white/5 min-h-[80px]"
                      />
                      <p className="text-xs text-muted-foreground">
                        Máximo 200 caracteres. Opcional, mas recomendado.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Logo do Grupo</Label>
                      <FileInput
                          value={selectedFile}
                          onChange={handleFileChange}
                          preview={previewUrl}
                          className="glass bg-white/5"
                        />
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: PNG, JPG, JPEG. Máximo: 5MB
                      </p>
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

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Lock className="h-4 w-4 text-orange-500" />
                            <span className="font-medium">Grupo Privado</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Apenas pessoas com a senha podem entrar
                          </p>
                        </div>
                        <Switch
                          checked={formData.tipo === "privado"}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ 
                              ...prev, 
                              tipo: checked ? "privado" : "publico",
                              senha: !checked ? "" : prev.senha 
                            }))
                          }
                        />
                      </div>

                      {formData.tipo === "privado" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="senha">Senha do Grupo *</Label>
                          <Input
                            id="senha"
                            type="password"
                            placeholder="Digite uma senha segura"
                            value={formData.senha}
                            onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                            className="glass bg-white/5"
                            minLength={4}
                            maxLength={20}
                            required={formData.tipo === "privado"}
                          />
                          <p className="text-xs text-muted-foreground">
                            Mínimo: 4 caracteres, Máximo: 20 caracteres
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Limite de Membros</span>
                    </CardTitle>
                    <CardDescription>
                      Controle quantas pessoas podem participar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_membros">Número Máximo de Membros</Label>
                      <Input
                        id="max_membros"
                        type="number"
                        placeholder="Ex: 50 (deixe vazio para ilimitado)"
                        value={formData.max_membros}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_membros: e.target.value }))}
                        min={2}
                        max={1000}
                        className="glass bg-white/5"
                      />
                      <p className="text-xs text-muted-foreground">
                        Mínimo: 2, Máximo: 1000
                      </p>
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