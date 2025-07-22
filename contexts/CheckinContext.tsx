"use client"

import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react'
import { Checkin, CreateCheckinData } from '@/types/checkin'
import { createCheckinApi, fetchGroupCheckins } from '@/lib/api/checkins'
import { toast } from 'sonner'

interface CheckinState {
  checkins: Checkin[]
  loading: boolean
  error: string | null
  userStats: {
    total: number
    weekly: number
    today: number
  } | null
}

interface CheckinContextType extends CheckinState {
  createCheckin: (data: CreateCheckinData) => Promise<{ success: boolean; error?: string }>
  loadGroupCheckins: (groupId: string) => Promise<void>
  refreshCheckins: (groupId: string) => Promise<void>
  isCreating: boolean
}

type CheckinAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CHECKINS'; payload: { checkins: Checkin[]; userStats?: any } }
  | { type: 'ADD_CHECKIN'; payload: Checkin }
  | { type: 'SET_CREATING'; payload: boolean }

const initialState: CheckinState = {
  checkins: [],
  loading: false,
  error: null,
  userStats: null
}

function checkinReducer(state: CheckinState, action: CheckinAction): CheckinState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    case 'SET_CHECKINS':
      return {
        ...state,
        checkins: action.payload.checkins,
        userStats: action.payload.userStats || state.userStats,
        loading: false,
        error: null
      }
    case 'ADD_CHECKIN':
      return {
        ...state,
        checkins: [action.payload, ...state.checkins]
      }
    case 'SET_CREATING':
      return { ...state, loading: action.payload }
    default:
      return state
  }
}

const CheckinContext = createContext<CheckinContextType | null>(null)

export function CheckinProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkinReducer, initialState)

  const loadGroupCheckins = useCallback(async (groupId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const result = await fetchGroupCheckins(groupId)
      
      if (result.success && result.checkins) {
        dispatch({
          type: 'SET_CHECKINS',
          payload: {
            checkins: result.checkins,
            userStats: (result as any).userStats
          }
        })
      } else {
        dispatch({ type: 'SET_ERROR', payload: result.error || 'Erro ao carregar check-ins' })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Erro de conexão' })
    }
  }, [])

  const refreshCheckins = useCallback(async (groupId: string) => {
    await loadGroupCheckins(groupId)
  }, [loadGroupCheckins])

  const createCheckin = useCallback(async (data: CreateCheckinData) => {
    dispatch({ type: 'SET_CREATING', payload: true })
    
    try {
      const result = await createCheckinApi(data)
      
      if (result.success && result.checkin) {
        dispatch({ type: 'ADD_CHECKIN', payload: result.checkin })
        toast.success('Check-in realizado com sucesso! 🎉')
        return { success: true }
      } else {
        toast.error(result.error || 'Erro ao fazer check-in')
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error('Erro de conexão ao fazer check-in')
      return { success: false, error: 'Erro de conexão' }
    } finally {
      dispatch({ type: 'SET_CREATING', payload: false })
    }
  }, [])

  const contextValue: CheckinContextType = {
    ...state,
    createCheckin,
    loadGroupCheckins,
    refreshCheckins,
    isCreating: state.loading
  }

  return (
    <CheckinContext.Provider value={contextValue}>
      {children}
    </CheckinContext.Provider>
  )
}

export function useCheckinContext() {
  const context = useContext(CheckinContext)
  if (!context) {
    throw new Error('useCheckinContext deve ser usado dentro de CheckinProvider')
  }
  return context
}