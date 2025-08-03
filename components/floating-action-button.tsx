"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export function FloatingActionButton() {
  const router = useRouter()

  const handleClick = () => {
    const activeGroupId = localStorage.getItem("activeGroupId")
    if (!activeGroupId) {
      router.push("/groups")
    } else {
      router.push("/checkins")
    }
  }

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      className="fixed bottom-24 right-4 z-40"
    >
      <Button
        onClick={handleClick}
        size="lg"
        className="h-14 w-14 rounded-full glass shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </motion.div>
  )
}
