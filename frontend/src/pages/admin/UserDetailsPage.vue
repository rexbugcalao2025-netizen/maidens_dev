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

/* Occupation editing */
const addingOccupation = ref(false)
const editingOccupation = ref(null)

/* Notes editing */
const editingNotes = ref(false)
const notesDraft = ref('')

const isEmployee = ref(false)

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
    /* ======================
       LOAD USER
       ====================== */
    const userRes = await api.get(`/users/${route.params.id}`)
    user.value = userRes.data

    /* ======================
       CHECK CLIENT (200 | 404)
       ====================== */
    const clientRes = await api.get(
      `/clients/by-user/${route.params.id}`,
      {
        validateStatus: status => status === 200 || status === 404
      }
    )

    client.value = clientRes.status === 200
      ? clientRes.data
      : false

    /* ======================
       CHECK EMPLOYEE (200 | 404)
       ====================== */
    const empRes = await api.get(
      `/employees/by-user/${route.params.id}`,
      {
        validateStatus: status => status === 200 || status === 404
      }
    )

    isEmployee.value = empRes.status === 200

  } catch (err) {
    console.error('LoadUserAndClient error:', err)

    notyf.error(
      err.response?.data?.message ||
      'Failed to load user details'
    )

    user.value = null
    client.value = false
    isEmployee.value = false

  } finally {
    loading.value = false
  }
}


onMounted(() => {
  loadUserAndClient()
})

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

/* ======================
   HELPERS
   ====================== */
const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : '—'
}

/* ======================
   CLIENT PROFILE
   ====================== */
const createClientProfile = async () => {
  try {
    await api.post('/clients', {
      user_id: user.value._id,
      occupation: [],
      notes: ''
    })

    notyf.success('Client profile created')
    await loadUserAndClient()
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to create client profile'
    )
  }
}

/* ======================
   EMPLOYEE PROFILE
   ====================== */
const createEmployeeProfile = () => {
  router.push({
    name: 'admin-create-employee',
    params: { userId: user.value._id }
  })
}

/* ======================
   OCCUPATION ACTIONS
   ====================== */
const startEditOccupation = (occ) => {
  editingOccupation.value = { ...occ }
}

const cancelEditOccupation = () => {
  editingOccupation.value = null
}

const addOccupation = async () => {
  try {
    await api.post(
      `/clients/${client.value._id}/occupations`,
      newOccupation.value
    )

    notyf.success('Occupation added successfully')

    // Reset form
    newOccupation.value = {
      position: '',
      company_name: '',
      address: '',
      year_joined: '',
      is_active: true
    }

    addingOccupation.value = false
    await loadUserAndClient()
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to add occupation'
    )
  }
}

const cancelAddOccupation = () => {
  addingOccupation.value = false
}

/* ======================
   UPDATE OCCUPATION
   ====================== */
const updateOccupation = async () => {
  try {
    await api.put(
      `/clients/${client.value._id}/occupations/${editingOccupation.value._id}`,
      {
        position: editingOccupation.value.position,
        company_name: editingOccupation.value.company_name,
        address: editingOccupation.value.address,
        year_joined: editingOccupation.value.year_joined,
        is_active: editingOccupation.value.is_active
      }
    )

    notyf.success('Occupation updated successfully')
    editingOccupation.value = null
    await loadUserAndClient()
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to update occupation'
    )
  }
}

/* ======================
   REMOVE OCCUPATION
   ====================== */
const removeOccupation = async (occId) => {
  const confirmed = confirm(
    'Are you sure you want to remove this occupation?'
  )

  if (!confirmed) return

  try {
    await api.delete(
      `/clients/${client.value._id}/occupations/${occId}`
    )

    notyf.success('Occupation removed successfully')
    await loadUserAndClient()
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to remove occupation'
    )
  }
}


/* ======================
   NOTES
   ====================== */

const startEditNotes = () => {
  notesDraft.value = client.value.notes || ''
  editingNotes.value = true
}

const cancelEditNotes = () => {
  editingNotes.value = false
  notesDraft.value = ''
}

const saveNotes = async () => {
  try {
    await api.put(
      `/clients/${client.value._id}/notes`,
      { notes: notesDraft.value }
    )

    notyf.success('Client notes updated')
    editingNotes.value = false
    await loadUserAndClient()
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to update client notes'
    )
  }
}

/* ======================
   IDENTIFY IF USER IS A CLIENT OR EMPLOYEE
   ====================== */
const detailsTitle = computed(() => {

  console.log(client);
  console.log(client.value.client_code);

  let userTitle = String;

  if (client.value.client_code) {
    userTitle = `Client Details - ${client.value.client_code}`
  } else {
    userTitle = 'User Details';
  };
  
  return userTitle;

})

const resolvedRole = computed(() => {
  if (!user.value) return 'User'

  if (user.value.is_admin === true) {
    return 'Admin'
  }

  if (isEmployee.value === true) {
    return 'Employee'
  }

  if (client.value && isEmployee.value === false) {
    return 'Client'
  }

  return 'User'
})

</script>

<template>
  <div class="container pt-4" style="max-width: 950px;">

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading user details...
    </div>

    <!-- ERROR -->
    <div v-else-if="!user" class="alert alert-danger">
      Failed to load user details
    </div>

    <!-- CONTENT -->
    <div v-else class="card">
      <div class="card-body">

        <!-- HEADER -->
        <h4 class="mb-3">
          <i
            v-if="isEmployee === true"
            class="bi bi-person-badge me-2"
          ></i>

          <i
            v-else-if="client && isEmployee === false"
            class="bi bi-heart-pulse me-2"
          ></i>

          <i
            v-else
            class="bi bi-person me-2"
          ></i>

          {{ detailsTitle }}
        </h4>

        <!-- ======================
             BASIC INFORMATION
             ====================== -->
        <h6 class="text-muted mb-2">Basic Information</h6>
        <ul class="list-group mb-4">

          <li class="list-group-item">
            <strong>Email:</strong> {{ user.email }}
          </li>

          <li class="list-group-item">
            <strong>Name:</strong> {{ displayName }}
          </li>

          <li class="list-group-item">
            <strong>Role:</strong>
            <span
              class="badge ms-1"
              :class="{
                'badge-plum': resolvedRole === 'Admin',
                'badge-dusty': resolvedRole === 'Employee',
                'badge-rose': resolvedRole === 'Client',
                'badge-muted': resolvedRole === 'User'
              }"
            >
              {{ resolvedRole }}
            </span>
          </li>

          <li class="list-group-item">
            <strong>Status: </strong>
            <span
              class="badge ms-1"
              :class="user.is_deleted ? 'badge-muted' : 'badge-rose'"
            >
              {{ user.is_deleted ? 'Inactive' : 'Active' }}
            </span>
          </li>

          <li class="list-group-item">
            <strong>Date Registered:</strong>
            {{ formatDate(user.createdAt) }}
          </li>

        </ul>

        <!-- ======================
             CONTACT INFORMATION
             ====================== -->
        <h6 class="text-muted mb-2">Contact Information</h6>
        <ul class="list-group mb-4">

          <li class="list-group-item">
            <strong>Address:</strong>
            {{ user.address || '—' }}
          </li>

          <li class="list-group-item">
            <strong>Phone Numbers:</strong>
            <ul v-if="user.phones?.length" class="mt-1 mb-0">
              <li v-for="phone in user.phones" :key="phone._id">
                {{ phone.type }}: {{ phone.value }}
              </li>
            </ul>
            <span v-else class="text-muted">—</span>
          </li>

        </ul>

        <!-- ======================
             PROFILE ACTIONS (USER ONLY)
             ====================== -->
        <div
          v-if="resolvedRole === 'User'"
          class="d-flex gap-2 mb-4"
        >
          <button
            class="btn btn-sm btn-outline-rose"
            @click="createClientProfile"
          >
            <i class="bi bi-heart-pulse me-1"></i>
            Create Client Profile
          </button>

          <button
            class="btn btn-sm btn-outline-plum"
            @click="createEmployeeProfile"
          >
            <i class="bi bi-person-badge me-1"></i>
            Create Employee Profile
          </button>
        </div>

        <!-- ======================
             CLIENT INFORMATION
             ====================== -->

        <section
          v-if="client && isEmployee === false"
          class="card mt-4"
        >
          <div class="card-body">
            <h5 class="mb-3">
              <i class="bi bi-person-badge me-2"></i>
              Client Information
            </h5>

            <!-- NO CLIENT -->
            <div v-if="!client" class="mb-4">
              <div class="text-muted mb-2">
                No client profile exists for this user.
              </div>

              <button
                v-if="client === false && isEmployee === false"
                class="btn btn-sm btn-outline-rose"
                @click="createClientProfile"
              >
                <i class="bi bi-plus-circle me-1"></i>
                Create Client Profile
              </button>

              <div v-else-if="isEmployee" class="text-muted small">
                This user is an employee and cannot be a client.
              </div>
            </div>

            <!-- CLIENT EXISTS -->
            <div v-else>

              <!-- ======================
                  CLIENT NOTES
                  ====================== -->
              <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <strong>Notes</strong>

                  <button
                    v-if="!editingNotes"
                    class="btn btn-sm btn-outline-rose"
                    @click="startEditNotes"
                  >
                    <i class="bi bi-pencil"></i>
                    Edit
                  </button>
                </div>

                <!-- VIEW MODE -->
                <div
                  v-if="!editingNotes"
                  class="text-muted"
                  style="white-space: pre-line;"
                >
                  {{ client.notes || '—' }}
                </div>

                <!-- EDIT MODE -->
                <div v-else>
                  <textarea
                    v-model="notesDraft"
                    class="form-control mb-2"
                    rows="4"
                    placeholder="Enter client notes..."
                  ></textarea>

                  <div class="d-flex gap-2">
                    <button class="btn btn-rose btn-sm" @click="saveNotes">
                      Save
                    </button>
                    <button
                      class="btn btn-muted btn-sm"
                      @click="cancelEditNotes"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <!-- ======================
                  OCCUPATIONS
                  ====================== -->
              <h6
                class="text-muted mb-2 d-flex justify-content-between align-items-center"
              >
                Occupations
                <button
                  class="btn btn-sm btn-outline-rose"
                  @click="addingOccupation = true"
                >
                  <i class="bi bi-plus"></i>
                  Add Occupation
                </button>
              </h6>

              <!-- ADD OCCUPATION FORM -->
              <div v-if="addingOccupation" class="card card-body mb-3">

                <div class="row g-2 mb-2">
                  <div class="col-md-6">
                    <label class="form-label">Position</label>
                    <input
                      v-model="newOccupation.position"
                      class="form-control"
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label">Company Name</label>
                    <input
                      v-model="newOccupation.company_name"
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="mb-2">
                  <label class="form-label">Company Address</label>
                  <input
                    v-model="newOccupation.address"
                    class="form-control"
                  />
                </div>

                <div class="row g-2 mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Year Joined</label>
                    <input
                      v-model="newOccupation.year_joined"
                      class="form-control"
                    />
                  </div>

                  <div class="col-md-6 d-flex align-items-center">
                    <div class="form-check mt-4">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        v-model="newOccupation.is_active"
                      />
                      <label class="form-check-label">Active</label>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button class="btn btn-rose btn-sm" @click="addOccupation">
                    Save
                  </button>
                  <button
                    class="btn btn-muted btn-sm"
                    @click="addingOccupation = false"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <!-- NO OCCUPATIONS -->
              <div
                v-if="!client.occupation?.length && !addingOccupation"
                class="text-muted mb-4"
              >
                No occupation records
              </div>

              <!-- OCCUPATION LIST -->
              <ul v-else class="list-group mb-4">
                <li
                  v-for="occ in client.occupation"
                  :key="occ._id"
                  class="list-group-item"
                >

                  <!-- EDIT MODE -->
                  <div
                    v-if="editingOccupation && editingOccupation._id === occ._id"
                  >
                    <div class="row g-2 mb-2">
                      <div class="col-md-6">
                        <label class="form-label">Position</label>
                        <input
                          v-model="editingOccupation.position"
                          class="form-control"
                        />
                      </div>

                      <div class="col-md-6">
                        <label class="form-label">Company Name</label>
                        <input
                          v-model="editingOccupation.company_name"
                          class="form-control"
                        />
                      </div>
                    </div>

                    <div class="mb-2">
                      <label class="form-label">Company Address</label>
                      <input
                        v-model="editingOccupation.address"
                        class="form-control"
                      />
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Year Joined</label>
                        <input
                          v-model="editingOccupation.year_joined"
                          class="form-control"
                        />
                      </div>

                      <div class="col-md-6 d-flex align-items-center">
                        <div class="form-check mt-4">
                          <input
                            type="checkbox"
                            class="form-check-input"
                            v-model="editingOccupation.is_active"
                          />
                          <label class="form-check-label">Active</label>
                        </div>
                      </div>
                    </div>

                    <div class="d-flex gap-2">
                      <button
                        class="btn btn-rose btn-sm"
                        @click="updateOccupation"
                      >
                        Save
                      </button>
                      <button
                        class="btn btn-muted btn-sm"
                        @click="cancelEditOccupation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  <!-- VIEW MODE -->
                  <div
                    v-else
                    class="d-flex justify-content-between align-items-start"
                  >
                    <div>
                      <strong>{{ occ.position }}</strong>
                      <div class="text-muted small">
                        {{ occ.company_name }}
                        <span v-if="occ.year_joined">
                          · Joined {{ occ.year_joined }}
                        </span>
                      </div>
                      <div v-if="occ.address" class="text-muted small">
                        {{ occ.address }}
                      </div>
                    </div>

                    <div class="d-flex gap-2">
                      <button
                        class="btn btn-sm btn-outline-rose"
                        @click="startEditOccupation(occ)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>

                      <button
                        class="btn btn-sm btn-muted"
                        @click="removeOccupation(occ._id)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>

                </li>
              </ul>

            </div>

          </div>
        </section>

        <!-- ======================
             ACTIVITY (DISPLAY ONLY)
             ====================== -->
        <h6 class="text-muted mb-2">Activity</h6>

        <ul class="list-group">

          <!-- LAST LOGIN (ALWAYS SHOWN) -->
          <li class="list-group-item">
            <strong>Last Login: </strong>
            <span class="text-muted">
              Not available yet
            </span>
          </li>

          <!-- LAST CLINIC VISIT (CLIENT ONLY) -->
          <li
            v-if="client && isEmployee === false"
            class="list-group-item"
          >
            <strong>Last Clinic Visit: </strong>
            <span class="text-muted">
              Not available yet
            </span>
          </li>

        </ul>

      </div>
    </div>

  </div>
</template>
