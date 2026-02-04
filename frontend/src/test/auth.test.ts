import { describe, it, expect, beforeEach } from 'vitest'
import {
  getToken,
  setToken,
  getUser,
  setUser,
  clearAuth,
  isAuthenticated,
  saveAuth,
} from '../store/auth'
import type { User } from '../types'

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should store and retrieve token', () => {
    expect(getToken()).toBeNull()
    setToken('test-token')
    expect(getToken()).toBe('test-token')
  })

  it('should store and retrieve user', () => {
    expect(getUser()).toBeNull()
    const user: User = { id: '1', username: 'test', role: 'user' }
    setUser(user)
    expect(getUser()).toEqual(user)
  })

  it('should check authentication status', () => {
    expect(isAuthenticated()).toBe(false)
    saveAuth('token', { id: '1', username: 'test', role: 'user' })
    expect(isAuthenticated()).toBe(true)
  })

  it('should clear auth state', () => {
    saveAuth('token', { id: '1', username: 'test', role: 'user' })
    expect(isAuthenticated()).toBe(true)
    clearAuth()
    expect(isAuthenticated()).toBe(false)
    expect(getToken()).toBeNull()
    expect(getUser()).toBeNull()
  })
})
