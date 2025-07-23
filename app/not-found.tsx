import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4 text-center">
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center opacity-5" />
      <div className="relative z-10 space-y-6">
        <h1 className="text-8xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-white">Página Não Encontrada</h2>
        <p className="text-gray-400 max-w-sm">
          A página que você está procurando pode ter sido removida ou não existe.
        </p>
        <Button asChild className="glass hover:bg-white/20">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o Início
          </Link>
        </Button>
      </div>
    </div>
  )
}