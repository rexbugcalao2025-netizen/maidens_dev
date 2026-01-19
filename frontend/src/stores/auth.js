import { defineStore } from 'pinia';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import router from '@/router';


const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 Minutes
const WARNING_TIME = 14 * 60 * 1000; // 14 Minutes
let inactivityTimer = null;
let warningTimer = null;




export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,                // 'admin' | 'user'
    isAuthenticated: false,
    loading: false,
    error: null,
    showInactivityWarning: false
  }),

  actions: {


    // 🔁 Start inactivity tracking
    startInactivityTimer(){
      this.clearInactivityTimer();

      // ⚠️ Show warning at 14 minutes
      warningTimer = setTimeout(()=>{
        this.showInactivityWarning = true;
      }, WARNING_TIME);

      // 🚪 Logout at 15 minutes
      inactivityTimer = setTimeout(() => {
        console.warn('User inactive for 15 minutes - loggin out');
        this.logout(true)
      }, INACTIVITY_LIMIT);
    },

    // ♻️ Reset on activity
    resetInactivityTimer(){
      if (!this.isAuthenticated) return;
      this.startInactivityTimer();
    },

    // 🧹 Clear timer
    clearInactivityTimer(){
      if (inactivityTimer){
        clearTimeout(inactivityTimer);
        inactivityTimer = null;
      }
    },

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
      const token = localStorage.getItem('accessToken')
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

        this.startInactivityTimer();

      } catch (err) {
        this.logout()
      }
    },


    // LOGIN
    async login(payload) {
      this.loading = true
      this.error = null

      try {
        const res = await api.post('/users/login', payload);

        const { user, accessToken } = res.data;

        // Save token
        localStorage.setItem('accessToken', accessToken);

        // Decode JWT (SOURCE OF TRUTH)
        const decoded = jwtDecode(accessToken);

        this.user = user;
        // this.role = decoded.isAdmin === true ? 'admin' : 'user'
        this.role = decoded.isAdmin ? 'admin' : 'user';
        this.isAuthenticated = true;

        this.startInactivityTimer();

        return res.data;

        
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.response?.data?.error ||
          'Invalid email or password';
        throw err
      } finally {
        this.loading = false;
      }
    },


    // LOGOUT
    logout(isAuto = false) {

      this.clearInactivityTimer();
      this.showInactivityWarning = false;

      this.user = null;
      this.role = null;
      this.isAuthenticated = false;
      this.error = null;

      localStorage.removeItem('accessToken');

      if (isAuto){
        router.push('/login');
      }
    }
  }
})
