"use client"

import { DashboardContent } from "@/components/dashboard-content"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trophy } from "lucide-react";
import { useGyncanaWinner } from "@/hooks/useGyncanaWinner";

export default function DashboardPage() {
  const { winnerInfo, clearWinner } = useGyncanaWinner();
  
  const handleCloseDialog = () => {
    clearWinner();
  };

  const dialogTitle = winnerInfo?.isWinner ? "Parabéns, Campeão!" : "A Gincana Terminou!";
  const dialogDescription = winnerInfo?.isWinner 
    ? `Você venceu a gincana e ganhou: ${winnerInfo.prizeDescription}! O administrador do grupo entrará em contato.`
    : `O grande vencedor da gincana foi ${winnerInfo?.winnerName}, que ganhou ${winnerInfo?.prizeDescription}!`;

  return (
    <>
      <DashboardContent />
      {winnerInfo && (
        <AlertDialog open={!!winnerInfo} onOpenChange={handleCloseDialog}>
          <AlertDialogContent className="glass-card">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center space-x-2">
                  <Trophy className="h-6 w-6 text-yellow-400"/>
                  <span>{dialogTitle}</span>
              </AlertDialogTitle>
              <AlertDialogDescription>
                {dialogDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleCloseDialog}>
                Fechar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}