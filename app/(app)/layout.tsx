import type React from "react"
import { BottomNavigation } from "@/components/bottom-navigation"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNavigation />
    </div>
  )
}
