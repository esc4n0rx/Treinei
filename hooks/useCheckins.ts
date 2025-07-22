"use client"

import { useCheckinContext } from '@/contexts/CheckinContext'

export function useCheckins() {
  return useCheckinContext()
}