<!-- src/components/Navbar.vue -->
 
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const isLoggedIn = computed(() => auth.isAuthenticated)
const isAdmin = computed(() => auth.role === 'admin')
const isUser = computed(() => auth.isAuthenticated && auth.role !== 'admin')

// 🌸 Display name with safe fallbacks
const displayName = computed(() => {
  if (!auth.user) return ''

  if (auth.user.full_name?.trim()) {
    return auth.user.full_name
  }

  if (auth.user.first_name || auth.user.last_name) {
    return `${auth.user.first_name ?? ''} ${auth.user.last_name ?? ''}`.trim()
  }

  if (auth.user.email) {
    return auth.user.email
  }

  // Absolute fallback (should almost never happen)
  return 'User'
})

const logout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <nav class="navbar navbar-expand-lg fixed-top custom-navbar">
    <div class="container-fluid">

      <!-- Brand -->
      <router-link class="navbar-brand" to="/">
        Four Maidens
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">

        <!-- LEFT MENU -->
        <ul class="navbar-nav me-auto">
          <!-- PUBLIC + USER -->
          <template v-if="!isAdmin">
            <li class="nav-item">
              <router-link class="nav-link" to="/">
                <i class="bi bi-house"></i> Home
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" to="/services">
                <i class="bi bi-stars"></i> Services
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" to="/contact">
                <i class="bi bi-envelope"></i> Contact Us
              </router-link>
            </li>
          </template>
        </ul>

        <!-- RIGHT MENU -->
        <ul class="navbar-nav ms-auto align-items-center">

          <!-- NOT LOGGED IN -->
          <template v-if="!isLoggedIn">
            <li class="nav-item">
              <router-link class="nav-link" to="/register">
                <i class="bi bi-person-plus"></i> Register
              </router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" to="/login">
                <i class="bi bi-box-arrow-in-right"></i> Login
              </router-link>
            </li>
          </template>

          <!-- LOGGED IN USER -->
          <template v-if="isUser">

            <!-- 🛒 CART -->
            <li class="nav-item">
              <router-link class="nav-link" to="/cart">
                <i class="bi bi-cart"></i> Cart
              </router-link>
            </li>

            <!-- 📦 ORDERS -->
            <li class="nav-item">
              <router-link class="nav-link" to="/orders">
                <i class="bi bi-receipt"></i> Orders
              </router-link>
            </li>

            <!-- 👤 PROFILE -->
            <li class="nav-item">
              <router-link class="nav-link" to="/profile">
                <i class="bi bi-person-circle"></i> Profile
              </router-link>
            </li>

            <!-- 🚪 LOGOUT -->
            <li class="nav-item">
              <button class="btn btn-link nav-link" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </li>

            <!-- 🌸 WELCOME TEXT (AFTER LOGOUT) -->
            <li class="nav-item d-flex align-items-center ms-2">

              <!-- Separator -->
              <span class="mx-2" style="opacity:0.5">|</span>

              <!-- Welcome -->
              <span class="small text-muted">
                Welcome,
                <span class="fw-semibold" style="color:#e85d8f">
                  {{ displayName }}
                </span>
              </span>

            </li>

          </template>


          <!-- ADMIN ONLY -->
          <template v-if="isAdmin">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-shield-lock"></i> Admin
              </a>

              <ul class="dropdown-menu dropdown-menu-end">
            
                <!-- Dashboard -->
                <li>
                  <router-link class="dropdown-item" to="/admin">
                    <i class="bi bi-speedometer2 me-2"></i>
                    Dashboard
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>

                <!-- People Management -->
                <li>
                  <router-link class="dropdown-item" to="/admin/users">
                    <i class="bi bi-people me-2"></i>
                    Users
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/admin/clients">
                    <i class="bi bi-person-badge me-2"></i>
                    Clients
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/admin/employees">
                    <i class="bi bi-person-workspace me-2"></i>
                    Employees
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>

                <!-- Transactions -->
                <li>
                  <router-link class="dropdown-item" to="/admin/client-orders">
                    <i class="bi bi-receipt-cutoff me-2"></i>
                    Client Orders
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/admin/client-services">
                    <i class="bi bi-clipboard-check me-2"></i>
                    Client Services
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>               

                <li>
                  <router-link class="dropdown-item" to="/admin/products">
                    <i class="bi bi-box me-2"></i>
                    Products
                  </router-link>
                </li>
                
                <!-- ✅ PRODUCT CATEGORIES -->
                <li>
                  <router-link class="dropdown-item" to="/admin/categories">
                    <i class="bi bi-tags me-2"></i>
                    Product Categories
                  </router-link>
                </li>

                <li>
                  <router-link class="dropdown-item" to="/admin/inventory">
                    <i class="bi bi-box-seam me-2"></i>
                    Product Inventory
                  </router-link>
                </li>

                <li><hr class="dropdown-divider" /></li>

                <!-- Catalog / Services -->
                <li>
                  <router-link class="dropdown-item" to="/admin/services">
                    <i class="bi bi-stars me-2"></i>
                    Services
                  </router-link>
                </li>

                <!-- ✅ SERVICE CATEGORIES -->
                <li>
                  <router-link class="dropdown-item" to="/admin/service-categories">
                    <i class="bi bi-bookmark me-2"></i>
                    Service Categories
                  </router-link>
                </li>
                
              </ul>
            </li>

            <!-- LOGOUT (ADMIN) -->
            <li class="nav-item">
              <button class="btn btn-link nav-link" @click="logout">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </li>
          </template>

        </ul>
      </div>
    </div>
  </nav>
</template>

<style scoped>
  .custom-navbar {
    background-color: #f7c6d9; /* light pink */
  }

  /* Brand */
  .custom-navbar .navbar-brand {
    color: #3a2a33;
    font-weight: 600;
  }

  /* Links */
  .custom-navbar .nav-link {
    color: #3a2a33;
    font-weight: 500;
  }

  /* Icons */
 .custom-navbar .nav-link i {
    font-size: 1.15rem;
     margin-right: 0.35rem; /* fine-tuned spacing */
    vertical-align: -0.15em;
    color: #b84c7a; /* rose accent */
    opacity: 0.9;
  }

  /* Hover & active */
  .custom-navbar .nav-link:hover,
  .custom-navbar .nav-link.router-link-active {
    color: #b84c7a;
  }

  /* .router-link-active {
    font-weight: bold;
    border-bottom: 2px solid #fff;
  } */

  /* Dropdown */
  .custom-navbar .dropdown-menu {
    background-color: #fde6ef;
    border: none;
  }

  .custom-navbar .dropdown-item {
    color: #3a2a33;
  }

  .custom-navbar .dropdown-item:hover {
    background-color: #f7c6d9;
    color: #b84c7a;
  }

  /* Toggler icon (mobile) */
  .custom-navbar .navbar-toggler {
    border-color: #3a2a33;
  }

  .custom-navbar .navbar-toggler-icon {
    filter: invert(20%);
  }

  /* Push page content below fixed navbar */
  body {
    padding-top: 56px;
  }

  .custom-navbar .dropdown-divider {
    opacity: 0.4;
  }

 

</style>



