import { describe, it, expect, beforeEach } from 'vitest'
import { http } from '../api/http'
import { setToken, clearAuth } from '../store/auth'

describe('http client', () => {
  beforeEach(() => {
    clearAuth()
  })

  it('should attach Authorization header when token exists', () => {
    setToken('my-jwt-token')

    // Create a mock request config
    const config = { headers: {} as Record<string, string> }

    // Get the request interceptor (first one added)
    const interceptor = (http.interceptors.request as any).handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBe('Bearer my-jwt-token')
  })

  it('should not attach Authorization header when no token', () => {
    const config = { headers: {} as Record<string, string> }
    const interceptor = (http.interceptors.request as any).handlers[0]
    const result = interceptor.fulfilled(config)

    expect(result.headers.Authorization).toBeUndefined()
  })
})
