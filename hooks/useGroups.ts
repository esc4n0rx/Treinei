"use client"

import { useGroups as useGroupsContext } from '@/contexts/GroupContext'
import { useState } from 'react'
import { createGroupApi, joinGroupApi, fetchPublicGroups } from '@/lib/api/groups'
import { CreateGroupData, JoinGroupData, Group } from '@/types/group'
import { toast } from 'sonner'
import { CreateGyncanaData } from '@/types/gyncana'
import { createGyncanaApi } from '@/lib/api/gyncana'

export function useGroups() {
  const context = useGroupsContext()
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [publicGroups, setPublicGroups] = useState<Group[]>([])
  const [loadingPublic, setLoadingPublic] = useState(false)

  const createGroup = async (data: CreateGroupData) => {
    try {
      setIsCreating(true)
      const result = await createGroupApi(data)

      if (result.success && result.group) {
        toast.success('Grupo criado com sucesso!')
        await context.refreshGroups()
        return { success: true, group: result.group }
      } else {
        toast.error(result.error || 'Erro ao criar grupo')
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Erro de conexão ao criar grupo')
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setIsCreating(false)
    }
  }

  const joinGroup = async (data: JoinGroupData) => {
    try {
      setIsJoining(true)
      const result = await joinGroupApi(data)

      if (result.success) {
        toast.success('Você entrou no grupo!')
        await context.refreshGroups()
        return { success: true, membership: result.membership }
      } else {
        toast.error(result.error || 'Erro ao entrar no grupo')
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Erro de conexão ao entrar no grupo')
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setIsJoining(false)
    }
  }

  const loadPublicGroups = async (searchQuery?: string) => {
    try {
      setLoadingPublic(true)
      const result = await fetchPublicGroups(searchQuery)

      if (result.success && result.groups) {
        setPublicGroups(result.groups)
        return { success: true, groups: result.groups }
      } else {
        setPublicGroups([])
        return { success: false, error: result.error }
      }
    } catch (error) {
      setPublicGroups([])
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setLoadingPublic(false)
    }
  }
  
  const createGyncana = async (data: CreateGyncanaData) => {
    const result = await createGyncanaApi(data);
    if (result.success) {
      await context.refreshGroups();
    }
    return result;
  }

  return {
    ...context,
    createGroup,
    joinGroup,
    loadPublicGroups,
    publicGroups,
    isCreating,
    isJoining,
    loadingPublic,
    createGyncana,
  }
}