<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../../api'
import notyf from '../../utils/notyf'

const users = ref([])
const loading = ref(true)

// 🔍 Search & Date Filters
const search = ref('')
const fromDate = ref('')
const toDate = ref('')

const currentPage = ref(1)
const pageSize = ref(10)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / pageSize.value)
)

// 🔎 Filtered users (search + date)
const filteredUsers = computed(() => {
  let result = users.value

  // Text search
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(user =>
      user.email?.toLowerCase().includes(q) ||
      user.full_name?.toLowerCase().includes(q) ||
      user.first_name?.toLowerCase().includes(q) ||
      user.last_name?.toLowerCase().includes(q)
    )
  }

  // From date
  if (fromDate.value) {
    const from = new Date(fromDate.value)
    result = result.filter(user =>
      new Date(user.createdAt) >= from
    )
  }

  // To date (include entire day)
  if (toDate.value) {
    const to = new Date(toDate.value)
    to.setHours(23, 59, 59, 999)
    result = result.filter(user =>
      new Date(user.createdAt) <= to
    )
  }

  return result
})

// 📡 Fetch users
onMounted(async () => {
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load users'
    )
  } finally {
    loading.value = false
  }
})
</script>


<template>
  <div class="container-fluid pt-4">

    <!-- HEADER + FILTERS -->
    <div class="d-flex justify-content-between align-items-start mb-3">

      <!-- LEFT: Title + Record Count -->
      <div>
        <h3 class="mb-1">
          <i class="bi bi-people me-2"></i>
          Users
        </h3>

        <div class="text-muted small">
          {{ filteredUsers.length }} record{{ filteredUsers.length === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- RIGHT: Filters -->
      <div class="d-flex gap-2 align-items-center pt-3">

        <!-- From Date -->
        <span>Search Filter</span>
        <input
          v-model="fromDate"
          type="date"
          class="form-control form-control-sm"
          title="From date"
          style="width: 200px"
        />

        <!-- To Date -->
        <input
          v-model="toDate"
          type="date"
          class="form-control form-control-sm"
          title="To date"
          style="width: 200px"
        />

        <button
          class="btn btn-sm btn-outline-secondary"
          @click="fromDate = ''; toDate = ''; search = ''"
          >
          Clear
        </button>

        <!-- Search -->
        <div class="input-group input-group-sm" style="width: 400px;">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Search users..."
          />
        </div>

      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading users...
    </div>

    <!-- USERS TABLE -->
    <div v-else class="card">
      <div class="card-body p-0">

        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Profile</th>
              <th>Status</th>
              <th class="text-end">Created</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            <!-- <tr v-for="user in filteredUsers" :key="user._id"> -->
            <tr v-for="user in paginatedUsers" :key="user._id">

              <!-- Email -->
              <td>{{ user.email }}</td>

              <!-- Name -->
              <td>
                {{
                  user.full_name && user.full_name.trim()
                    ? user.full_name
                    : (user.first_name || user.last_name)
                      ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim()
                      : '—'
                }}
              </td>

              <!-- Role -->
              <td>
                <span
                  class="badge"
                  :class="user.is_admin ? 'bg-danger' : 'bg-secondary'"
                >
                  {{ user.is_admin ? 'Admin' : 'User' }}
                </span>
              </td>

              <!-- Profile -->
              <td>
                <span
                  class="badge"
                  :class="user.is_profile_complete
                    ? 'bg-success'
                    : 'bg-warning text-dark'"
                >
                  {{ user.is_profile_complete ? 'Complete' : 'Incomplete' }}
                </span>
              </td>

              <!-- Status -->
              <td>
                <span
                  class="badge"
                  :class="user.is_deleted ? 'bg-secondary' : 'bg-success'"
                >
                  {{ user.is_deleted ? 'Inactive' : 'Active' }}
                </span>
              </td>

              <!-- Created -->
              <td class="text-end text-muted">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>

              <!-- Actions -->
              <td class="text-end">
                <router-link
                  :to="`/admin/users/${user._id}`"
                  class="btn btn-sm btn-outline-primary"
                >
                  <i class="bi bi-eye me-1"></i>
                  View
                </router-link>
              </td>

            </tr>

            <!-- EMPTY STATE -->
            <tr v-if="filteredUsers.length === 0">
              <td colspan="7" class="text-center text-muted py-4">
                No users found
              </td>
            </tr>

          </tbody>
        </table>

        <div class="d-flex justify-content-between align-items-center p-3">

        <div class="text-muted small">
          Page {{ currentPage }} of {{ totalPages }}
        </div>

        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="currentPage--">Prev</button>
          </li>

          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="currentPage = page">
              {{ page }}
            </button>
          </li>

          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <button class="page-link" @click="currentPage++">Next</button>
          </li>
        </ul>

      </div>

      </div>
    </div>

  </div>
</template>
