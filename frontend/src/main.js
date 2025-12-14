// import 'bootstrap/dist/css/bootstrap.css';
// import 'bootstrap/dist/js/bootstrap.min.js';
// import 'bootstrap-icons/font/bootstrap-icons.min.css';

// import 'notyf/notyf.min.css';
// import './assets/main.css';

// import { createApp } from 'vue'
// import App from './App.vue'
// import { createPinia } from 'pinia';
// import { createRouter, createWebHistory } from 'vue-router';


// const router = createRouter({
//     history: createWebHistory,
//     routes: [
//             { path      : '/',
//               name      : 'Home',
//               component : HomePage    
//             },
//             { path      : '/login',
//               name      : 'Login',
//               component : LoginPage
//             },
//             { path      : '/logout',
//               name      : 'Logout',
//               component : LogoutPage
//             },
//             { path      : '/:catchAll(.*)',
//               component : ErrorPage
//             }
//         ]
// });

// const app = createApp(App);

//     app.use(createPinia());
//     app.use(router);
//     app.mount('#app');

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

// Bootstrap imports
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Example pages
import HomePage from './pages/HomePage.vue';
import AboutPage from './pages/AboutPage.vue';

// Routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
