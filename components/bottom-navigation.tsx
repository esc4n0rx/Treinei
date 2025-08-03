"use client"

import { motion } from "framer-motion"
import { Home, Camera, Trophy, User, Users } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", icon: Home, label: "Início" },
  { href: "/groups", icon: Users, label: "Grupos" },
  { href: "/checkins", icon: Camera, label: "Check-ins" },
  { href: "/ranking", icon: Trophy, label: "Ranking" },
  { href: "/profile", icon: User, label: "Perfil" },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t"
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <motion.div whileTap={{ scale: 0.95 }} className="flex flex-col items-center py-2 px-1">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isActive ? 1.2 : 1,
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Icon
                      className={cn("h-6 w-6 transition-colors", isActive ? "text-primary" : "text-muted-foreground")}
                    />
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 transition-colors",
                    isActive ? "text-primary font-medium" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
