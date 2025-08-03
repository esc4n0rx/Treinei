"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { Group } from '@/types/group'
import { fetchUserGroups } from '@/lib/api/groups'
import { useAuth } from '@/hooks/useAuth'

interface GroupContextData {
  groups: Group[]
  activeGroup: Group | null
  loading: boolean
  refreshGroups: () => Promise<void>
  setActiveGroup: (group: Group | null) => void
  hasGroups: boolean
}

const GroupContext = createContext<GroupContextData>({} as GroupContextData)

interface GroupProviderProps {
  children: ReactNode
}

export function GroupProvider({ children }: GroupProviderProps) {
  const { isAuthenticated, user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [activeGroup, setActiveGroupState] = useState<Group | null>(null)

  const [loading, setLoading] = useState(true)

  const refreshGroups = useCallback(async () => {
    if (!isAuthenticated) {
      setGroups([])
      setActiveGroupState(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await fetchUserGroups()
      
      if (result.success && result.groups) {
        setGroups(result.groups)
        
        const currentActiveGroupId = activeGroup?.id || localStorage.getItem('activeGroupId');
        let groupToActivate: Group | null = null; // Tipagem explícita

        if (currentActiveGroupId) {
            const foundGroup = result.groups.find(g => g.id === currentActiveGroupId);
            groupToActivate = foundGroup || null; // Converte undefined para null
        }

        if (!groupToActivate && result.groups.length > 0) {
            groupToActivate = result.groups[0];
        }

        setActiveGroupState(groupToActivate);
        if (groupToActivate) {
            localStorage.setItem('activeGroupId', groupToActivate.id);
        }

      } else {
        setGroups([])
        setActiveGroupState(null)
        localStorage.removeItem('activeGroupId')
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error)
      setGroups([])
      setActiveGroupState(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, activeGroup?.id]);

  const setActiveGroup = (group: Group | null) => {
    setActiveGroupState(group)
    if (group) {
      localStorage.setItem('activeGroupId', group.id)
    } else {
      localStorage.removeItem('activeGroupId')
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshGroups()
    } else {
      setGroups([])
      setActiveGroupState(null)
      setLoading(false)
    }
  }, [isAuthenticated, refreshGroups])

  const hasGroups = groups.length > 0

  return (
    <GroupContext.Provider
      value={{
        groups,
        activeGroup,
        loading,
        refreshGroups,
        setActiveGroup,
        hasGroups
      }}
    >
      {children}
    </GroupContext.Provider>
  )
}

export function useGroups() {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error('useGroups deve ser usado dentro de GroupProvider')
  }
  return context
}