
import { authStorage } from '@/lib/auth-storage'
import { AuthResponse } from '@/types/auth'

export async function refreshAuthToken(): Promise<AuthResponse> {
  try {
    const authData = authStorage.getAuthData()
    
    if (!authData?.token) {
      return {
        success: false,
        error: 'Token não encontrado'
      }
    }

    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authData.token}`
      },
      body: JSON.stringify({
        refreshToken: authData.refreshToken
      })
    })

    const result: AuthResponse = await response.json()

    if (!result.success) {
      console.error('Erro no refresh do token:', result.error)
    }

    return result
  } catch (error) {
    console.error('Erro na requisição de refresh:', error)
    return {
      success: false,
      error: 'Erro de conexão durante refresh do token'
    }
  }
}