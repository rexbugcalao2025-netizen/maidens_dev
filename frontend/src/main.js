
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import { authChannel } from '@/utils/authChannel';
import notyf from '@/utils/notyf';

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

// 🔁 Listen for logout from other tabs
if (authChannel){
    authChannel.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT'){
            auth.logout(false, true); // silent logout
        }
    };
}

// 🔁 Fallback (localStorage sync)
window.addEventListener('storage', (event) => {

    // 🔥 Token was removed in another tab
    if (
        event.key === 'accessToken' &&
        event.oldValue &&
        !event.newValue
    ) {
        notyf.warning('You are logged out from another tab');
        auth.logout(false, true);
    }

    // Explicit auth broadcast
    if (event.key === 'auth-event') {
        const data = JSON.parse(event.newValue || '{}');
        if (data.type === 'LOGOUT') {
            notyf.warning('You were logged out from another tab.');
            auth.logout(false, true);
        }
    }
})


// 🔥 Restore login here
auth.restoreSession();  

app.mount('#app');