// components/ui/file-input.tsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileInputProps {
  value?: File | null
  onChange: (file: File | null) => void
  preview?: string | null
  fallback?: string
  disabled?: boolean
  className?: string
}

export function FileInput({ 
  value, 
  onChange, 
  preview, 
  fallback = "IMG", 
  disabled = false, 
  className 
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn("flex flex-col items-center space-y-2", className)}>
      <div className="relative">
        <Avatar className="h-16 w-16 cursor-pointer" onClick={handleClick}>
          <AvatarImage src={preview || ""} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={disabled}
        className="glass hover:bg-white/10 bg-transparent"
      >
        <Camera className="h-3 w-3 mr-1" />
        {value ? 'Alterar' : 'Adicionar'}
      </Button>
    </div>
  )
}