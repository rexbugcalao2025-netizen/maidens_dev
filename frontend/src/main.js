
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';

// Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

import './assets/admin.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

const auth = useAuthStore(pinia);

// 🔥 Restore login here
auth.restoreSession();  

// 🔥 Start inactivity timer if logged in
if (auth.isAuthenticated) {
    auth.startInactivityTimer();
}

app.mount('#app');