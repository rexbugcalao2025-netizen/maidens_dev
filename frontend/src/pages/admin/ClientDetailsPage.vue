<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import notyf from '../../utils/notyf'

const route = useRoute()
const router = useRouter()

/* ======================
   STATE
====================== */
const user = ref(null)
const client = ref(null)
const loading = ref(true)
const services = ref([])
const servicesLoading = ref(false)

/* Occupation */
const addingOccupation = ref(false)
const editingOccupation = ref(null)

/* Notes */
const editingNotes = ref(false)
const notesDraft = ref('')

const newOccupation = ref({
  position: '',
  company_name: '',
  address: '',
  year_joined: '',
  is_active: true
})

/* ======================
   FETCH DATA
====================== */
const loadUserAndClient = async () => {
  loading.value = true
  try {
    const userRes = await api.get(`/users/${route.params.id}`)
    user.value = userRes.data

    const clientRes = await api.get(
      `/clients/by-user/${route.params.id}`,
      { validateStatus: s => s === 200 || s === 404 }
    )
    client.value = clientRes.status === 200 ? clientRes.data : false

    /* 🔒 CLIENT GUARD — RIGHT HERE */
    if (!client.value) {      

      router.replace({
        name: 'admin-user-details',
        params: { id: route.params.id }
      });

      return
    }

  } catch (err) {
    notyf.error('Failed to load user details')
    user.value = null
    client.value = false
  } finally {
    loading.value = false
    // ✅ Safe to load client-only data here
    await loadClientServices()
  }
}

const loadClientServices = async () => {
  if (!client.value) return

  servicesLoading.value = true

  try {
    const res = await api.get(
      `/client-services/client/${client.value._id}`
    )
    services.value = res.data ?? []
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load client services'
    )
    services.value = []
  } finally {
    servicesLoading.value = false
  }
}


onMounted(loadUserAndClient)

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

const detailsTitle = computed(() => {
  if (client.value?.client_code) {
    return `Client Details – ${client.value.client_code}`
  }
  return 'User Details'
})

/* ======================
   HELPERS
====================== */
const formatDate = d => d ? new Date(d).toLocaleDateString() : '—';

const createClientService = () => {
  router.push({
    name: 'admin-create-client-service',
    params: {
      clientId: client.value._id
    }
  })
}

/* ======================
   NOTES
====================== */
const startEditNotes = () => {
  notesDraft.value = client.value.notes || ''
  editingNotes.value = true
}

const saveNotes = async () => {
  await api.put(`/clients/${client.value._id}/notes`, {
    notes: notesDraft.value
  })
  notyf.success('Notes updated')
  editingNotes.value = false
  loadUserAndClient()
}
</script>

<template>
  <div class="container pt-4" style="max-width: 950px">

    <div v-if="loading" class="text-muted">Loading…</div>
    <div v-else-if="!user" class="alert alert-danger">Failed to load user</div>

    <div v-else class="card">
      <div class="card-body">

        <!-- HEADER -->
        <h4 class="mb-3">{{ detailsTitle }}</h4>

        <!-- TABS -->
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#overview">
              Overview
            </button>
          </li>

          <li class="nav-item" v-if="client">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#client">
              Client
            </button>
          </li>

          <li
            class="nav-item"
            v-if="client"
          >
            <button
              class="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#services"
            >
              Services
            </button>
          </li>

          <li class="nav-item">
            <button class="nav-link" data-bs-toggle="tab" data-bs-target="#system">
              System
            </button>
          </li>
        </ul>

        <div class="tab-content">

          <!-- OVERVIEW -->
          <div class="tab-pane fade show active" id="overview">

            <!-- BASIC INFORMATION -->
            <ul class="list-group mb-4">
              <li class="list-group-item">
                <strong>Email:</strong> {{ user.email }}
              </li>
              <li class="list-group-item">
                <strong>Name:</strong> {{ displayName }}
              </li>
              <li class="list-group-item">
                <strong>Role:</strong> {{ resolvedRole }}
              </li>
              <li class="list-group-item">
                <strong>Status:</strong>
                {{ user.is_deleted ? 'Inactive' : 'Active' }}
              </li>
              <li class="list-group-item">
                <strong>Registered:</strong>
                {{ formatDate(user.createdAt) }}
              </li>
            </ul>          
            
            <!-- ======================
                ACTIVITY (NOW IN OVERVIEW)
                ====================== -->
            <div class="card card-body bg-light-subtle">
              <h6 class="text-muted mb-2">
                Activity
              </h6>

              <ul class="list-group list-group-flush">
                <li class="list-group-item px-0">
                  <strong>Last Login:</strong>
                  <span class="text-muted">
                    Not available yet
                  </span>
                </li>

                <li
                  v-if="client"
                  class="list-group-item px-0"
                >
                  <strong>Last Clinic Visit:</strong>
                  <span class="text-muted">
                    Not available yet
                  </span>
                </li>

                <li class="list-group-item px-0 text-muted small">
                  More activity history will appear here
                </li>
              </ul>
            </div>

          </div>

          <!-- ======================
              SERVICES TAB
          ====================== -->
          <div
            class="tab-pane fade"
            id="services"
            v-if="client"
          >

            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">Services Availed</h6>

              <!-- ADMIN ONLY -->
              <button
                v-if="user.is_admin"
                class="btn btn-sm btn-outline-rose"
                @click="createClientService"
              >
                <i class="bi bi-plus-circle me-1"></i>
                New Service
              </button>
            </div>

            <!-- LOADING -->
            <div v-if="servicesLoading" class="text-muted">
              Loading services...
            </div>

            <!-- EMPTY -->
            <div
              v-else-if="!services.length"
              class="text-muted"
            >
              No services recorded for this client.
            </div>

            <!-- TABLE -->
            <div v-else class="table-responsive">
              <table class="table table-sm align-middle">
                <thead class="table-light">
                  <tr>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th class="text-end">Amount</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="svc in services"
                    :key="svc._id"
                  >
                    <td>
                      <strong>{{ svc.service_name }}</strong>
                      <div class="text-muted small">
                        {{ svc.category_name }}
                      </div>
                    </td>

                    <td>
                      {{ formatDate(svc.date_availed) }}
                    </td>

                    <td>
                      <span
                        class="badge"
                        :class="{
                          'badge-rose': svc.status === 'completed',
                          'badge-dusty': svc.status === 'ongoing',
                          'badge-muted': svc.status === 'cancelled'
                        }"
                      >
                        {{ svc.status }}
                      </span>
                    </td>

                    <td class="text-end">
                      {{ svc.amount?.toLocaleString() ?? '—' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>


          <!-- SYSTEM -->
          <div class="tab-pane fade" id="system">
            <ul class="list-group">
              <li class="list-group-item"><strong>User ID:</strong> <code>{{ user._id }}</code></li>
              <li v-if="client" class="list-group-item"><strong>Client ID:</strong> <code>{{ client._id }}</code></li>
              <li class="list-group-item"><strong>Admin:</strong> {{ user.is_admin ? 'Yes' : 'No' }}</li>
              <li class="list-group-item"><strong>Deleted:</strong> {{ user.is_deleted ? 'Yes' : 'No' }}</li>
              <li class="list-group-item"><strong>Updated:</strong> {{ formatDate(user.updatedAt) }}</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
