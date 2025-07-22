"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Plus, Search } from "lucide-react"
import Link from "next/link"

export function GroupEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-4 space-y-6"
    >
      <Card className="glass-card max-w-md w-full text-center">
        <CardHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </motion.div>
          
          <CardTitle className="text-xl">Você não faz parte de nenhum grupo</CardTitle>
          <CardDescription className="text-base">
            Para começar a fazer check-ins, você precisa estar em pelo menos um grupo de treino.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <Button asChild className="glass hover:bg-white/20">
              <Link href="/groups/create">
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Grupo
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="glass hover:bg-white/10 bg-transparent">
              <Link href="/groups">
                <Search className="h-4 w-4 mr-2" />
                Encontrar Grupos
              </Link>
            </Button>
          </div>
          
          <div className="pt-4 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              💡 Dica: Crie um grupo para seus amigos ou encontre grupos públicos para se juntar!
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}