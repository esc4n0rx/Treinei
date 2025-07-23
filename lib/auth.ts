// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { User } from '@/types/auth'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'
const REFRESH_TOKEN_EXPIRES_IN = '30d'

/**
 * Gera um hash da senha usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verifica se uma senha corresponde ao hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Gera um token JWT para o usuário
 */
export function generateToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    nome: user.nome,
    iat: Math.floor(Date.now() / 1000)
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

/**
 * Gera um refresh token (para implementação futura)
 */
export function generateRefreshToken(user: User): string {
  const payload = {
    userId: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000)
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

/**
 * Verifica e decodifica um token JWT
 */
export function verifyToken(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expirado')
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token inválido')
    } else {
      throw new Error('Erro na verificação do token')
    }
  }
}

/**
 * Verifica se um token está próximo do vencimento
 */
export function isTokenNearExpiry(token: string, minutesThreshold: number = 60): boolean {
  try {
    const decoded = jwt.decode(token) as any
    if (!decoded?.exp) return true

    const expiryTime = decoded.exp * 1000 // Converter para milliseconds
    const thresholdTime = minutesThreshold * 60 * 1000
    
    return (expiryTime - Date.now()) <= thresholdTime
  } catch {
    return true
  }
}

/**
 * Extrai o token do cabeçalho Authorization
 */
export function extractTokenFromHeader(authorization?: string): string | null {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null
  }
  return authorization.substring(7)
}