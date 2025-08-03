"use client"

export interface AuthStorageData {
  token: string
  user: any
  refreshToken?: string
  expiresAt: number
}

class AuthStorage {
  private readonly TOKEN_KEY = 'treinei_token'
  private readonly USER_KEY = 'treinei_user'
  private readonly REFRESH_TOKEN_KEY = 'treinei_refresh_token'
  private readonly EXPIRES_KEY = 'treinei_expires_at'

  setAuthData(data: AuthStorageData): void {
    try {
      const authPayload = {
        token: data.token,
        user: data.user,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt
      }

      if (this.isStorageAvailable(localStorage)) {
        localStorage.setItem(this.TOKEN_KEY, data.token)
        localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))
        localStorage.setItem(this.EXPIRES_KEY, data.expiresAt.toString())
        if (data.refreshToken) {
          localStorage.setItem(this.REFRESH_TOKEN_KEY, data.refreshToken)
        }
      }

      if (this.isStorageAvailable(sessionStorage)) {
        sessionStorage.setItem(this.TOKEN_KEY, data.token)
        sessionStorage.setItem(this.USER_KEY, JSON.stringify(data.user))
        sessionStorage.setItem(this.EXPIRES_KEY, data.expiresAt.toString())
      }

      if (typeof document !== 'undefined') {
        const expires = new Date(data.expiresAt).toUTCString()
        document.cookie = `${this.TOKEN_KEY}=${data.token}; expires=${expires}; path=/; SameSite=Strict; Secure`
      }

    } catch (error) {
      console.error('Erro ao armazenar dados de auth:', error)
    }
  }

  getAuthData(): AuthStorageData | null {
    try {
      const localData = this.getFromStorage(localStorage)
      if (localData && this.isTokenValid(localData.expiresAt)) {
        return localData
      }
      const sessionData = this.getFromStorage(sessionStorage)
      if (sessionData && this.isTokenValid(sessionData.expiresAt)) {
        return sessionData
      }

      const cookieToken = this.getCookieValue(this.TOKEN_KEY)
      if (cookieToken) {
        const userData = this.getStorageValue(this.USER_KEY, localStorage)
        if (userData) {
          return {
            token: cookieToken,
            user: JSON.parse(userData),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
          }
        }
      }

      return null
    } catch (error) {
      console.error('Erro ao recuperar dados de auth:', error)
      return null
    }
  }

  clearAuthData(): void {
    try {
      if (this.isStorageAvailable(localStorage)) {
        localStorage.removeItem(this.TOKEN_KEY)
        localStorage.removeItem(this.USER_KEY)
        localStorage.removeItem(this.REFRESH_TOKEN_KEY)
        localStorage.removeItem(this.EXPIRES_KEY)
      }
      if (this.isStorageAvailable(sessionStorage)) {
        sessionStorage.removeItem(this.TOKEN_KEY)
        sessionStorage.removeItem(this.USER_KEY)
        sessionStorage.removeItem(this.EXPIRES_KEY)
      }

      if (typeof document !== 'undefined') {
        document.cookie = `${this.TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    } catch (error) {
      console.error('Erro ao limpar dados de auth:', error)
    }
  }

  shouldRefreshToken(): boolean {
    const data = this.getAuthData()
    if (!data) return false

    const oneHourInMs = 60 * 60 * 1000
    const timeUntilExpiry = data.expiresAt - Date.now()
    
    return timeUntilExpiry <= oneHourInMs && timeUntilExpiry > 0
  }

  private getFromStorage(storage: Storage): AuthStorageData | null {
    if (!this.isStorageAvailable(storage)) return null

    const token = storage.getItem(this.TOKEN_KEY)
    const userStr = storage.getItem(this.USER_KEY)
    const expiresAtStr = storage.getItem(this.EXPIRES_KEY)
    const refreshToken = storage.getItem(this.REFRESH_TOKEN_KEY)

    if (!token || !userStr || !expiresAtStr) return null

    try {
      return {
        token,
        user: JSON.parse(userStr),
        refreshToken: refreshToken || undefined,
        expiresAt: parseInt(expiresAtStr)
      }
    } catch {
      return null
    }
  }

  private getStorageValue(key: string, storage: Storage): string | null {
    if (!this.isStorageAvailable(storage)) return null
    return storage.getItem(key)
  }

  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  private isStorageAvailable(storage: Storage): boolean {
    try {
      const test = '__storage_test__'
      storage.setItem(test, test)
      storage.removeItem(test)
      return true
    } catch {
      return false
    }
  }

  private isTokenValid(expiresAt: number): boolean {
    return Date.now() < expiresAt
  }
}

export const authStorage = new AuthStorage()