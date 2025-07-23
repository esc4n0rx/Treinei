// app/(app)/layout.tsx
"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { BottomNavigation } from "@/components/bottom-navigation"
import { useAuth } from "@/hooks/useAuth"
import { GroupProvider } from "@/contexts/GroupContext"
import { CheckinProvider } from "@/contexts/CheckinContext"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, loading, router])

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, não renderizar nada (redirecionamento já foi feito)
  if (!isAuthenticated) {
    return null
  }

  return (
    <GroupProvider>
      <CheckinProvider>
        <div className="min-h-screen bg-background pb-20">
          {children}
          <BottomNavigation />
        </div>
      </CheckinProvider>
    </GroupProvider>
  )
}