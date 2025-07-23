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

  return <CreateGroupContentInner />
}

function CreateGroupContentInner() {
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
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando...
              </>
            ) : (
              'Criar Grupo'
            )}
          </Button>
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-4">
        <form id="create-group-form" onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 glass mb-6">
                <TabsTrigger value="info" className="flex items-center space-x-2">
                  {getTabIcon("info")}
                  <span>Informações</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  {getTabIcon("settings")}
                  <span>Configurações</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                    <CardDescription>
                      Defina o nome e descrição do seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome do Grupo *</Label>
                      <Input
                        id="nome"
                        placeholder="Ex: Academia Fitness"
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
                        className="glass min-h-[100px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Logo do Grupo (Opcional)</Label>
                       <FileInput
                          value={selectedFile}
                          onChange={handleFileChange}
                          preview={previewUrl}
                          fallback="GR"
                        />
                      {previewUrl && (
                        <div className="flex justify-center">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="h-20 w-20 rounded-full object-cover border-2 border-primary/20"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Categorias</CardTitle>
                    <CardDescription>
                      Selecione as categorias que melhor descrevem seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {groupCategories.map((category) => (
                        <motion.button
                          key={category.id}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCategoryToggle(category.id)}
                          className={`
                            p-3 rounded-lg border glass text-left transition-all
                            ${selectedCategories.includes(category.id)
                              ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                              : 'border-border hover:border-primary/50'
                            }
                          `}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`h-3 w-3 rounded-full ${category.color}`} />
                            <span className="font-medium">{category.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Privacidade</CardTitle>
                    <CardDescription>
                      Defina quem pode entrar no seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div 
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all
                          ${formData.tipo === 'publico' 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                        onClick={() => setFormData(prev => ({ ...prev, tipo: 'publico', senha: '' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Globe className="h-5 w-5 text-green-500" />
                          <div>
                            <h4 className="font-medium">Público</h4>
                            <p className="text-sm text-muted-foreground">
                              Qualquer pessoa pode encontrar e entrar
                            </p>
                          </div>
                        </div>
                      </div>

                      <div 
                        className={`
                          p-4 rounded-lg border cursor-pointer transition-all
                          ${formData.tipo === 'privado' 
                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                        onClick={() => setFormData(prev => ({ ...prev, tipo: 'privado' }))}
                      >
                        <div className="flex items-center space-x-3">
                          <Lock className="h-5 w-5 text-orange-500" />
                          <div>
                            <h4 className="font-medium">Privado</h4>
                            <p className="text-sm text-muted-foreground">
                              Necessário senha para entrar
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {formData.tipo === 'privado' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <Label htmlFor="senha">Senha do Grupo *</Label>
                        <Input
                          id="senha"
                          type="password"
                          placeholder="Digite uma senha segura"
                          value={formData.senha}
                          onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                          className="glass"
                          required={formData.tipo === 'privado'}
                        />
                      </motion.div>
                    )}
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Limites</CardTitle>
                    <CardDescription>
                      Configure os limites do seu grupo
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_membros">Máximo de Membros (Opcional)</Label>
                      <Input
                        id="max_membros"
                        type="number"
                        min="2"
                        max="1000"
                        placeholder="Ex: 50"
                        value={formData.max_membros}
                        onChange={(e) => setFormData(prev => ({ ...prev, max_membros: e.target.value }))}
                        className="glass"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deixe em branco para não ter limite. Mínimo: 2, Máximo: 1000
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