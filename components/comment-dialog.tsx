"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"
import { CheckinComment } from "@/types/checkin"
import { useAuth } from "@/hooks/useAuth"

interface CommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  checkinId: string
  comments: CheckinComment[]
  onAddComment: (checkinId: string, content: string) => Promise<void>
  loading: boolean
}

export function CommentDialog({
  open,
  onOpenChange,
  checkinId,
  comments,
  onAddComment,
  loading
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim() || isSubmitting) return

    try {
      setIsSubmitting(true)
      await onAddComment(checkinId, newComment.trim())
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCommentTime = (dateString: string): string => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
        return diffInMinutes <= 0 ? 'Agora' : `${diffInMinutes}m`
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`
      } else {
        const days = Math.floor(diffInHours / 24)
        return `${days}d`
      }
    } catch (error) {
      return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card max-w-md mx-4 max-h-[80vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle>Comentários</DialogTitle>
          <DialogDescription>
            {comments.length === 0 ? 'Seja o primeiro a comentar!' : `${comments.length} comentário${comments.length > 1 ? 's' : ''}`}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Nenhum comentário ainda</p>
              </div>
            ) : (
              comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex space-x-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.usuario?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                    {comment.usuario?.nome
                       ?.split(" ")
                       .map((n) => n[0])
                       .join("") || "U"}
                   </AvatarFallback>
                 </Avatar>

                 <div className="flex-1 min-w-0">
                   <div className="flex items-center space-x-2">
                     <p className="text-sm font-medium">{comment.usuario?.nome}</p>
                     <span className="text-xs text-muted-foreground">
                       {formatCommentTime(comment.created_at)}
                     </span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-1 break-words">
                     {comment.conteudo}
                   </p>
                 </div>
               </motion.div>
             ))
           )}
         </div>
       </ScrollArea>

       {/* Input para novo comentário */}
       <form onSubmit={handleSubmit} className="flex space-x-2 pt-4 border-t border-border/50">
         <Avatar className="h-8 w-8">
           <AvatarImage src={user?.avatar_url || "/placeholder.svg"} />
           <AvatarFallback className="text-xs">
             {user?.nome
               ?.split(" ")
               .map((n) => n[0])
               .join("") || "U"}
           </AvatarFallback>
         </Avatar>
         
         <div className="flex-1 flex space-x-2">
           <Input
             value={newComment}
             onChange={(e) => setNewComment(e.target.value)}
             placeholder="Adicione um comentário..."
             className="glass flex-1"
             maxLength={500}
             disabled={isSubmitting}
           />
           
           <Button
             type="submit"
             size="sm"
             disabled={!newComment.trim() || isSubmitting}
             className="glass hover:bg-white/20 px-3"
           >
             {isSubmitting ? (
               <Loader2 className="h-4 w-4 animate-spin" />
             ) : (
               <Send className="h-4 w-4" />
             )}
           </Button>
         </div>
       </form>
     </DialogContent>
   </Dialog>
 )
}