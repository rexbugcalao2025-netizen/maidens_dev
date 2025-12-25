import { defineStore } from 'pinia'
import api from '../api'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,                // 'admin' | 'user'
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  actions: {

    // REGISTER
    async register(payload) {
      this.loading = true
      this.error = null

      try {
        const res = await api.post('/users/register', payload)
        return res.data
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    // RESTORE SESSION
    restoreSession() {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const decoded = jwtDecode(token)

        // Optional: check expiry
        const now = Date.now() / 1000
        if (decoded.exp && decoded.exp < now) {
          this.logout()
          return
        }

        this.isAuthenticated = true
        this.role = decoded.isAdmin ? 'admin' : 'user'

        // Minimal user restore (safe)
        this.user = {
          _id: decoded.id,
          email: decoded.email
        }
      } catch (err) {
        this.logout()
      }
    },


    // LOGIN
    async login(payload) {
      this.loading = true
      this.error = null

      try {
        const res = await api.post('/users/login', payload)

        const { user, accessToken } = res.data

        // Save token
        localStorage.setItem('token', accessToken)

        // Decode JWT (SOURCE OF TRUTH)
        const decoded = jwtDecode(accessToken)

        this.user = user
        // this.role = decoded.isAdmin === true ? 'admin' : 'user'
        this.role = decoded.isAdmin ? 'admin' : 'user'
        this.isAuthenticated = true

        return res.data
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email or password'
        throw err
      } finally {
        this.loading = false
      }
    },


    // LOGOUT
    logout() {
      this.user = null
      this.role = null
      this.isAuthenticated = false
      this.error = null

      localStorage.removeItem('token')
    }
  }
})
