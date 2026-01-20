import { defineStore } from 'pinia';
import api from '../api';
import { jwtDecode } from 'jwt-decode';
import router from '@/router';
import { authChannel } from '@/utils/authChannel';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 Minutes
const WARNING_TIME = 60 * 1000; // 1 Minute warning
let inactivityTimer = null;
let warningTimer = null;
let countdownInterval = null;




export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    role: null,                // 'admin' | 'user'
    isAuthenticated: false,
    loading: false,
    error: null,
    showInactivityWarning: false,
    countdown: 60 // 60 seconds
  }),

  actions: {


    // 🔁 Start inactivity tracking
    startInactivityTimer(){
      this.clearInactivityTimers();

      // ⚠️ Show warning at 14 minutes
      warningTimer = setTimeout(()=>{
        this.showInactivityWarning = true;
        this.startCountdown();
      }, INACTIVITY_LIMIT - WARNING_TIME);

    },

    // ♻️ Start countdown
    startCountdown(){
      this.countdown = 60;
      countdownInterval = setInterval(() => {
        this.countdown--;

        if (this.countdown <= 0){
          this.logout(true);
        }
      }, 1000);
    },

    // ♻️ Reset on activity
    resetInactivityTimer(){
      if (!this.isAuthenticated) return;

      this.clearInactivityTimers();

      // Hide warning if visible
      this.showInactivityWarning = false;      

      // Restart countdown + main timer
      this.startInactivityTimer();
    },

    // 🧹 Clear timer
    clearInactivityTimers(){
      // if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownInterval) clearInterval(countdownInterval);

      // inactivityTimer = null;
      warningTimer = null;
      countdownInterval = null;
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
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);

        // Optional: check expiry
        const now = Date.now() / 1000
        if (decoded.exp && decoded.exp < now) {
          this.logout();
          return
        }

        this.isAuthenticated = true;
        this.role = decoded.isAdmin ? 'admin' : 'user';

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
    logout(isAuto = false, silent = false) {

      this.clearInactivityTimers();
      this.showInactivityWarning = false;

      this.user = null;
      this.role = null;
      this.isAuthenticated = false;
      this.error = null;

      localStorage.removeItem('accessToken');

      // 🔔 MULTI-TAB SYNC --- closes all tabs when logged out
      if (!silent){


          localStorage.setItem('auth-event', JSON.stringify({
            type: 'LOGOUT',
            time: Date.now()
          }));        
      }
    
      router.push('/login');

    }
  }
})
