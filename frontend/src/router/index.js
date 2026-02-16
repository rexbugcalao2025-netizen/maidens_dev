// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Public pages
import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';

// Admin pages (static imports where already used)
import ProductCategoryPage from '../pages/admin/product-categories/ProductCategoryPage.vue';
import ServiceCategoryPage from '../pages/admin/service-categories/ServiceCategoryPage.vue';
import CreateServicePage from '@/pages/admin/services/CreateService.vue';
import ServicesListPage from '@/pages/admin/services/ServicesList.vue';
import ViewServicePage from '@/pages/admin/services/ViewService.vue';
import EditServicePage from '@/pages/admin/services/EditService.vue';
import CreateNewCustomerServicePage from '@/pages/admin/NewClientServicePage.vue';

const routes = [
  // =====================
  // PUBLIC ROUTES
  // =====================
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

  // =====================
  // ADMIN ROUTES
  // =====================
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      // Dashboard
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../pages/admin/DashboardPage.vue')
      },

      // Users
      {
        path: 'users',
        component: () => import('../pages/admin/UsersPage.vue')
      },
      {
        path: 'users/:id',
        component: () => import('../pages/admin/UserDetailsPage.vue')
      },

      // Clients
      {
        path: 'clients',
        component: () => import('../pages/admin/ClientsPage.vue')
      },

      // Employees
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

      // =====================
      // SERVICES (FIXED)
      // =====================
      {
        path: 'services',
        name: 'AdminServices',
        component: ServicesListPage
      },
      {
        path: 'services/new',
        name: 'AdminNewClientService',                
        component: CreateNewCustomerServicePage,
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'services/create',
        name: 'CreateService',
        component: CreateServicePage
      },
      {
        path: 'services/:id',
        name: 'ViewService',
        component: ViewServicePage,
        props: true
      },
      {
        path: 'services/:serviceId/edit',
        name: 'EditService',
        component: EditServicePage,
        props: true
      },

      // Service Categories
      {
        path: 'service-categories',
        name: 'AdminServiceCategories',
        component: ServiceCategoryPage
      },

      // Products
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

      // Product Categories
      {
        path: 'categories',
        name: 'AdminCategories',
        component: ProductCategoryPage
      },

      // Client Orders / Services
      {
        path: 'client-orders',
        component: () => import('../pages/admin/ClientOrdersPage.vue')
      },
      {
        path: 'client-services',
        component: () => import('../pages/admin/ClientServicesPage.vue')
      },

      // Inventory
      {
        path: 'inventory',
        name: 'Inventory',
        component: () => import('@/modules/inventory/pages/InventoryPage.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// =====================
// ROUTE GUARDS
// =====================
router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  const requiresAuth = to.matched.some(
    record => record.meta.requiresAuth
  );

  const requiresAdmin = to.matched.some(
    record => record.meta.requiresAdmin
  );


  if (requiresAuth && !auth.isAuthenticated){
    return next('/login');
  }

  if (requiresAdmin && auth.role !== 'admin'){
    return next('/');
  }

  // if (to.meta.requiresAuth && !auth.isAuthenticated) {
  //   return next('/login')
  // }

  // if (to.meta.requiresAdmin && auth.role !== 'admin') {
  //   return next('/')
  // }

  next()
})

export default router
