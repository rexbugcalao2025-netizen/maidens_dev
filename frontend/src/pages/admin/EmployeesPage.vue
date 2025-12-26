<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../../api'
import notyf from '../../utils/notyf'

// Data
const employees = ref([])
const loading = ref(true)

// Filters
const search = ref('')
const fromDate = ref('')
const toDate = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 15, 20]

// Fetch employees
onMounted(async () => {
  try {
    const res = await api.get('/employees')
    employees.value = res.data
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load employees'
    )
  } finally {
    loading.value = false
  }
})

// Filtered employees
const filteredEmployees = computed(() => {
  let result = employees.value

  // Search
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter(e =>
      e.user?.email?.toLowerCase().includes(q) ||
      e.user?.full_name?.toLowerCase().includes(q)
    )
  }

  // From date (date hired)
  if (fromDate.value) {
    const from = new Date(fromDate.value)
    result = result.filter(e =>
      new Date(e.date_hired) >= from
    )
  }

  // To date
  if (toDate.value) {
    const to = new Date(toDate.value)
    to.setHours(23, 59, 59, 999)
    result = result.filter(e =>
      new Date(e.date_hired) <= to
    )
  }

  return result
})

// Pagination helpers
const totalPages = computed(() =>
  Math.ceil(filteredEmployees.value.length / pageSize.value) || 1
)

const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredEmployees.value.slice(
    start,
    start + pageSize.value
  )
})

// Reset page when filters change
watch([search, fromDate, toDate, pageSize], () => {
  currentPage.value = 1
})
</script>



<template>
  <div class="container-fluid pt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-start mb-3">

      <div>
        <h3 class="mb-1">
          <i class="bi bi-people-fill me-2"></i>
          Employees
        </h3>
        <div class="text-muted small">
          {{ filteredEmployees.length }} record{{ filteredEmployees.length === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- FILTERS -->
      <div class="d-flex gap-2 align-items-center pt-3">

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

        <div class="input-group input-group-sm" style="width: 350px;">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="search"
            type="text"
            class="form-control"
            placeholder="Search employees..."
          />
        </div>

      </div>
    </div>

    <!-- PAGE SIZE -->
    <div class="d-flex align-items-center gap-2 mb-2">
      <span class="small text-muted">Show</span>
      <select
        v-model="pageSize"
        class="form-select form-select-sm"
        style="width: 90px"
      >
        <option v-for="s in pageSizes" :key="s" :value="s">
          {{ s }}
        </option>
      </select>
      <span class="small text-muted">entries</span>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading employees...
    </div>

    <!-- TABLE -->
    <div v-else class="card">
      <div class="card-body p-0">

        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Current Position</th>
              <th>Status</th>
              <th class="text-end">Date Hired</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="emp in paginatedEmployees"
              :key="emp._id"
            >
              <td>{{ emp.user?.email || '—' }}</td>

              <td>{{ emp.user?.full_name?.trim() || '—' }}</td>

              <td>
                {{
                  emp.job_position?.find(p => p.is_active)?.title || '—'
                }}
              </td>

              <td>
                <span class="badge badge-rose">Active</span>
              </td>

              <td class="text-end text-muted">
                {{ new Date(emp.date_hired).toLocaleDateString() }}
              </td>

              <td class="text-end">
                <router-link
                  :to="`/admin/employees/${emp._id}`"
                  class="btn btn-sm btn-outline-rose"
                >
                  <i class="bi bi-eye me-1"></i>
                  View
                </router-link>
              </td>
            </tr>

            <tr v-if="paginatedEmployees.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                No employees found
              </td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>

    <!-- PAGINATION -->
    <div
      v-if="totalPages > 1"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="text-muted small">
        Page {{ currentPage }} of {{ totalPages }}
      </div>

      <ul class="pagination pagination-sm mb-0">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="currentPage--">Previous</button>
        </li>

        <li
          v-for="p in totalPages"
          :key="p"
          class="page-item"
          :class="{ active: p === currentPage }"
        >
          <button class="page-link" @click="currentPage = p">
            {{ p }}
          </button>
        </li>

        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="currentPage++">Next</button>
        </li>
      </ul>
    </div>

  </div>
</template>
