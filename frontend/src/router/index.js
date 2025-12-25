import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Public pages
import HomePage from '../pages/HomePage.vue'
import LoginPage from '../pages/LoginPage.vue'
import RegisterPage from '../pages/RegisterPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },

  // ADMIN ROUTES
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../pages/admin/DashboardPage.vue')
      },
      {
        path: 'users',
        component: () => import('../pages/admin/UsersPage.vue')
      },      
      {
        path: 'users/:id',
        component: () => import('../pages/admin/UserDetailsPage.vue')
      },
      {
        path: 'clients',
        component: () => import('../pages/admin/ClientsPage.vue')
      },
      {
        path: 'employees',
        component: () => import('../pages/admin/EmployeesPage.vue')
      },
      {
        path: 'services',
        component: () => import('../pages/admin/ServicesPage.vue')
      },
      {
        path: 'products',
        component: () => import('../pages/admin/ProductsPage.vue')
      },
      {
        path: 'product-categories',
        component: () => import('../pages/admin/ProductCategoriesPage.vue')
      },
      {
        path: 'client-orders',
        component: () => import('../pages/admin/ClientOrdersPage.vue')
      },
      {
        path: 'client-services',
        component: () => import('../pages/admin/ClientServicesPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/* ROUTE GUARDS */
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresAdmin && auth.role !== 'admin') {
    return next('/')
  }

  next()
})

export default router
