// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Public pages
import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';

// Admin pages
import ProductCategoryPage from '../pages/admin/product-categories/ProductCategoryPage.vue';
import ServiceCategoryPage from '../pages/admin/service-categories/ServiceCategoryPage.vue';
import CreateServicePage from '@/pages/admin/services/CreateService.vue'
import ServicesListPage from  '@/pages/admin/services/ServicesList.vue';
import ViewServicePage from '@/pages/admin/services/ViewService.vue';
import EditServicePage from '@/pages/admin/services/EditService.vue';


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
        path: 'employees/create/:userId',
        name: 'admin-create-employee',
        component: () => import('../pages/admin/CreateEmployeePage.vue')        
      },
      {
        path: 'employees/:id',
        name: 'admin-employee-details',
        component: () => import('../pages/admin/EmployeeDetailsPage.vue')
      },      
      {
        path: 'services',
        component: () => import('../pages/admin/services/ServicesList.vue')
      },
      {
        path: "/admin/services/create",
        name: "CreateService",
        component: CreateServicePage
      },
      {
        path: '/admin/services',
        name: 'AdminServices',
        component: ServicesListPage
      },
      {
        path: '/admin/services/:id',
        name: 'ViewService',
        component: ViewServicePage,
        props: true
      },
      {
        path: '/admin/services/:serviceId/edit',
        name: 'EditService',
        component: EditServicePage,
        props: true
      },
      {
          path: 'service-categories',
          name: 'AdminServiceCategories',
          component: ServiceCategoryPage,
          meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'products',
        component: () => import('../pages/admin/ProductsPage.vue')
      },      
      {
      path: 'products/new',
      component: () => import('../pages/admin/products/ProductForm.vue')
      },
      {
      path: 'products/:id',
      component: () => import('../pages/admin/products/ProductForm.vue')
      },
      {
          path: 'categories',
          name: 'AdminCategories',
          component: ProductCategoryPage,
          meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'client-orders',
        component: () => import('../pages/admin/ClientOrdersPage.vue')
      },
      {
        path: 'client-services',
        component: () => import('../pages/admin/ClientServicesPage.vue')
      },
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/modules/inventory/pages/InventoryPage.vue'),
        meta: { requiresAuth: true,  requiresAdmin: true}
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
