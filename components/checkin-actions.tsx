"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Share } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CheckinActionsProps {
  checkinId: string
  likesCount: number
  commentsCount: number
  userLiked: boolean
  onLike: (checkinId: string) => Promise<void>
  onComment: (checkinId: string) => void
  disabled?: boolean
}

export function CheckinActions({
  checkinId,
  likesCount,
  commentsCount,
  userLiked,
  onLike,
  onComment,
  disabled = false
}: CheckinActionsProps) {
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async () => {
    if (isLiking || disabled) return
    
    try {
      setIsLiking(true)
      await onLike(checkinId)
    } catch (error) {
      toast.error("Erro ao curtir check-in")
    } finally {
      setIsLiking(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check-in Treinei',
          text: 'Confira este check-in no Treinei!',
          url: window.location.href
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("Link copiado para a área de transferência!")
      }
    } catch (error) {
      toast.error("Erro ao compartilhar")
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLiking || disabled}
        className={cn(
          "glass hover:bg-white/10 px-3 py-1.5 h-auto transition-all duration-200",
          userLiked && "text-red-500 hover:text-red-400"
        )}
      >
        <Heart 
          className={cn(
            "h-4 w-4 mr-1.5 transition-all duration-200",
            userLiked && "fill-current"
          )} 
        />
        <span className="text-sm font-medium">{likesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onComment(checkinId)}
        disabled={disabled}
        className="glass hover:bg-white/10 px-3 py-1.5 h-auto"
      >
        <MessageCircle className="h-4 w-4 mr-1.5" />
        <span className="text-sm font-medium">{commentsCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        disabled={disabled}
        className="glass hover:bg-white/10 px-2 py-1.5 h-auto"
      >
        <Share className="h-4 w-4" />
      </Button>
    </div>
  )
}