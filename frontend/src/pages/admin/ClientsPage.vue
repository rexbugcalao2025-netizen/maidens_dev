<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../api'
import notyf from '../../utils/notyf'

// Data
const clients = ref([])
const loading = ref(true)

// Filters
const search = ref('')
const fromDate = ref('')
const toDate = ref('')

// 📄 Pagination
const currentPage = ref(1)
const pageSize = ref(10)

const pageSizes = [10, 15, 20]

watch([search, fromDate, toDate, pageSize], () => {
  currentPage.value = 1
})

// Fetch clients
onMounted(async () => {
  try {
    const res = await api.get('/clients')
    clients.value = res.data
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load clients'
    )
  } finally {
    loading.value = false
  }
})

// Filtered clients
const filteredClients = computed(() => {
  let result = clients.value

  // Search (email / name)
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(c =>
      c.user?.email?.toLowerCase().includes(q) ||
      c.user?.full_name?.toLowerCase().includes(q)
    )
  }

  // From date
  if (fromDate.value) {
    const from = new Date(fromDate.value)
    result = result.filter(c =>
      new Date(c.createdAt) >= from
    )
  }

  // To date
  if (toDate.value) {
    const to = new Date(toDate.value)
    to.setHours(23, 59, 59, 999)
    result = result.filter(c =>
      new Date(c.createdAt) <= to
    )
  }

  return result
})

  // Pagination
const totalPages = computed(() =>
  Math.ceil(filteredClients.value.length / pageSize.value) || 1
)

const paginatedClients = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredClients.value.slice(start, end)
})

</script>

<template>
  <div class="container-fluid pt-4">

    <!-- HEADER + FILTERS -->
    <div class="d-flex justify-content-between align-items-start mb-3">

      <!-- LEFT -->
      <div>
        <h3 class="mb-1">
          <i class="bi bi-briefcase me-2"></i>
          Clients
        </h3>

        <div class="text-muted small">
          {{ filteredClients.length }} record{{ filteredClients.length === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- RIGHT FILTERS -->
       <div class="d-flex gap-2 align-items-start pt-3">
      
        <span class="pt-1">Search Filter</span>
        <input
          v-model="fromDate"
          type="date"
          class="form-control form-control-sm"
          style="width: 180px"
        />

        <input
          v-model="toDate"
          type="date"
          class="form-control form-control-sm"
          style="width: 180px"
        />

        <button
          class="btn btn-sm btn-outline-secondary"
          @click="fromDate = ''; toDate = ''; search = ''"
        >
          Clear
        </button>

        <!-- SEARCH + PAGE SIZE (STACKED) -->
        <div class="d-flex flex-column align-items-end gap-1">

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

          <!-- Page Size -->
          <div class="d-flex align-items-center gap-1">
            <span class="text-muted small">Rows</span>
            <select
              v-model.number="pageSize"
              class="form-select form-select-sm"
              style="width: 80px"
            >
              <option :value="10">10</option>
              <option :value="15">15</option>
              <option :value="20">20</option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading clients...
    </div>

    <!-- TABLE -->
    <div v-else class="card">
      <div class="card-body p-0">

        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Occupations</th>
              <th>Status</th>
              <th class="text-end">Created</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="client in paginatedClients" :key="client._id">

              <!-- EMAIL -->
              <td>{{ client.user?.email || '—' }}</td>

              <!-- NAME -->
              <td>
                {{ client.user?.full_name?.trim() || '—' }}
              </td>

              <!-- OCCUPATION COUNT -->
              <td>
                {{ client.occupation?.length || 0 }}
              </td>

              <!-- STATUS -->
              <td>
                <span
                  class="badge"
                  :class="client.is_deleted ? 'badge-muted' : 'badge-rose'"
                >
                  {{ client.is_deleted ? 'Inactive' : 'Active' }}
                </span>
              </td>

              <!-- CREATED -->
              <td class="text-end text-muted">
                {{ new Date(client.createdAt).toLocaleDateString() }}
              </td>

              <!-- ACTION -->
              <td class="text-end">
                <router-link
                  :to="`/admin/users/${client.user._id}`"
                  class="btn btn-sm btn-outline-rose"
                >
                  <i class="bi bi-eye me-1"></i>
                  View
                </router-link>
              </td>

            </tr>

            <!-- EMPTY -->
            <tr v-if="filteredClients.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                No clients found
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
