<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import notyf from '../../utils/notyf'

const route = useRoute()
const router = useRouter()

const employee = ref(null)
const user = ref(null)
const loading = ref(true)

/* ======================
   FETCH DATA
   ====================== */
const loadEmployee = async () => {
  loading.value = true

  try {
    // Load employee
    const empRes = await api.get(`/employees/${route.params.id}`)
    employee.value = empRes.data

    // Load linked user
    const userRes = await api.get(`/users/${employee.value.user_id._id || employee.value.user_id}`)
    user.value = userRes.data

  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load employee'
    )
    router.push('/admin/employees')
  } finally {
    loading.value = false
  }
}

onMounted(loadEmployee)

/* ======================
   COMPUTED
   ====================== */
const displayName = computed(() => {
  if (!user.value) return ''
  if (user.value.full_name?.trim()) return user.value.full_name
  if (user.value.first_name || user.value.last_name)
    return `${user.value.first_name ?? ''} ${user.value.last_name ?? ''}`.trim()
  return user.value.email
})

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : '—'
}
</script>

<template>
  <div class="container pt-4" style="max-width: 900px;">

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading employee details...
    </div>

    <!-- CONTENT -->
    <div v-else-if="employee && user" class="card">
      <div class="card-body">

        <!-- HEADER -->
        <h4 class="mb-3">
          <i class="bi bi-person-badge me-2"></i>
          Employee Details
        </h4>

        <!-- BASIC INFO -->
        <h6 class="text-muted mb-2">Basic Information</h6>
        <ul class="list-group mb-4">
          <li class="list-group-item">
            <strong>Email:</strong> {{ user.email }}
          </li>
          <li class="list-group-item">
            <strong>Name:</strong> {{ displayName }}
          </li>
          <li class="list-group-item">
            <strong>Date Hired:</strong> {{ formatDate(employee.date_hired) }}
          </li>
          <li class="list-group-item">
            <strong>Date Retired:</strong> {{ formatDate(employee.date_retired) }}
          </li>
          <li class="list-group-item">
            <strong>TIN:</strong> {{ employee.tax_identification_number }}
          </li>
        </ul>

        <!-- JOB POSITIONS -->
        <h6 class="text-muted mb-2">Job Positions</h6>
        <ul v-if="employee.job_position?.length" class="list-group mb-4">
          <li
            v-for="pos in employee.job_position"
            :key="pos._id"
            class="list-group-item"
          >
            <div class="fw-semibold">{{ pos.title }}</div>
            <div class="small text-muted">
              {{ pos.entity }} |
              {{ formatDate(pos.date_started) }}
              →
              {{ formatDate(pos.date_ended) }}
            </div>
            <span
              class="badge mt-1"
              :class="pos.is_active ? 'badge-rose' : 'badge-muted'"
            >
              {{ pos.is_active ? 'Active' : 'Inactive' }}
            </span>
          </li>
        </ul>
        <div v-else class="text-muted mb-4">
          No job positions recorded
        </div>

        <!-- CREDENTIALS -->
        <h6 class="text-muted mb-2">Credentials</h6>
        <ul v-if="employee.credentials?.length" class="list-group">
          <li
            v-for="cred in employee.credentials"
            :key="cred._id"
            class="list-group-item"
          >
            <div class="fw-semibold">
              {{ cred.credential_type.replace('_', ' ') }}
            </div>
            <div class="small text-muted">
              {{ cred.value }} |
              {{ formatDate(cred.acquire_on_date) }}
              →
              {{ formatDate(cred.expire_on_date) }}
            </div>
            <span
              class="badge mt-1"
              :class="cred.is_active ? 'badge-rose' : 'badge-muted'"
            >
              {{ cred.is_active ? 'Active' : 'Inactive' }}
            </span>
          </li>
        </ul>
        <div v-else class="text-muted">
          No credentials recorded
        </div>

      </div>
    </div>

  </div>
</template>
