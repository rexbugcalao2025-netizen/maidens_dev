<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../api'
import notyf from '../../utils/notyf'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const saving = ref(false)
const user = ref(null)

// Form
const form = ref({
  date_hired: '',
  tax_identification_number: ''
})

const jobPositions = ref([
  {
    title: '',
    entity: '',
    date_started: '',
    date_ended: '',
    is_active: true
  }
])

const credentials = ref([
  {
    credential_type: '',
    value: '',
    acquire_on_date: '',
    expire_on_date: '',
    is_active: true
  }
])

// Load user info
onMounted(async () => {
  try {
    const res = await api.get(`/users/${route.params.userId}`)
    user.value = res.data
  } catch (err) {
    notyf.error('Failed to load user')
    router.push('/admin/users')
  } finally {
    loading.value = false
  }
})

// Submit
const submit = async () => {
  if (!form.value.date_hired || !form.value.tax_identification_number) {
    notyf.error('Please fill in all required fields')
    return
  }

  saving.value = true

  try {
    await api.post('/employees', {
        user_id: user.value._id,
        date_hired: form.value.date_hired,
        tax_identification_number: form.value.tax_identification_number,

        job_position: jobPositions.value.map(p => ({
            title: p.title,
            entity: p.entity.toUpperCase(),
            date_started: p.date_started,
            date_ended: p.date_ended || null,
            is_active: p.is_active
        })),

        credentials: credentials.value.map(c => ({
            credential_type: c.credential_type,
            value: c.value,
            acquire_on_date: c.acquire_on_date,
            expire_on_date: c.expire_on_date || null,
            is_active: c.is_active
        }))
    })

    console.log('CREATE EMPLOYEE RESPONSE:', res.data)

    notyf.success('Employee profile created')
    router.push({
      name: 'admin-employee-details',
      params: { id: res.data.employee._id }
    })



  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to create employee'
    )
  } finally {
    saving.value = false
  }
}

// Helper Methods
const addJobPosition = () => {
  jobPositions.value.push({
    title: '',
    entity: '',
    date_started: '',
    date_ended: '',
    is_active: true
  })
}

const removeJobPosition = (index) => {
  jobPositions.value.splice(index, 1)
}

const addCredential = () => {
  credentials.value.push({
    credential_type: '',
    value: '',
    acquire_on_date: '',
    expire_on_date: '',
    is_active: true
  })
}

const removeCredential = (index) => {
  credentials.value.splice(index, 1)
}



</script>

<template>
  <div class="container pt-4" style="max-width: 700px;">

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading user...
    </div>

    <!-- CONTENT -->
    <div v-else class="card">
      <div class="card-body">

        <!-- HEADER -->
        <h4 class="mb-3 mt-3">
          <i class="bi bi-person-badge me-2"></i>
          Create Employee Profile
        </h4>

        <!-- USER INFO -->
        <div class="mb-4">
          <div class="text-muted small mb-1">User</div>
          <div><strong>Email:</strong> {{ user.email }}</div>
          <div><strong>Name:</strong> {{ user.full_name || '—' }}</div>
        </div>

        <!-- FORM -->
        <form @submit.prevent="submit">

          <!-- DATE HIRED -->
          <div class="mb-3">
            <label class="form-label">Date Hired</label>
            <input
              v-model="form.date_hired"
              type="date"
              class="form-control"
              required
            />
          </div>

          <!-- TIN -->
          <div class="mb-4">
            <label class="form-label">Tax Identification Number</label>
            <input
              v-model="form.tax_identification_number"
              type="text"
              class="form-control"
              placeholder="Enter TIN"
              required
            />
          </div>

            <!-- ======================
                JOB POSITIONS
                ====================== -->
            <h6 class="text-muted mb-2 mt-4">
            <i class="bi bi-briefcase me-1"></i>
            Job Positions
            </h6>

            <div
            v-for="(position, index) in jobPositions"
            :key="index"
            class="border rounded p-3 mb-3"
            >

            <!-- TITLE -->
            <div class="mb-2">
                <label class="form-label">Title</label>
                <input
                v-model="position.title"
                type="text"
                class="form-control"
                placeholder="e.g. Senior Therapist"
                required
                />
            </div>

            <!-- ENTITY -->
            <div class="mb-2">
                <label class="form-label">Company</label>
                <input
                v-model="position.entity"
                type="text"
                class="form-control"
                placeholder="e.g. FOUR MAIDENS"
                required
                />
            </div>

            <!-- DATES -->
            <div class="row">
                <div class="col-md-6 mb-2">
                <label class="form-label">Date Started</label>
                <input
                    v-model="position.date_started"
                    type="date"
                    class="form-control"
                    required
                />
                </div>

                <div class="col-md-6 mb-2">
                <label class="form-label">Date Ended</label>
                <input
                    v-model="position.date_ended"
                    type="date"
                    class="form-control"
                />
                </div>
            </div>

            <!-- ACTIVE -->
            <div class="form-check mb-2">
                <input
                v-model="position.is_active"
                type="checkbox"
                class="form-check-input"
                :id="`active-${index}`"
                />
                <label
                class="form-check-label"
                :for="`active-${index}`"
                >
                Active
                </label>
            </div>

            <!-- REMOVE -->
            <button
                v-if="jobPositions.length > 1"
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removeJobPosition(index)"
            >
                <i class="bi bi-trash me-1"></i>
                Remove
            </button>

            </div>

            <button
            type="button"
            class="btn btn-sm btn-outline-plum"
            @click="addJobPosition"
            >
            <i class="bi bi-plus-circle me-1"></i>
            Add Another Position
            </button>

            <!-- ======================
                CREDENTIALS
                ====================== -->
            <h6 class="text-muted mb-2 mt-4">
            <i class="bi bi-patch-check me-1"></i>
            Credentials
            </h6>

            <div
            v-for="(cred, index) in credentials"
            :key="index"
            class="border rounded p-3 mb-3"
            >

            <!-- TYPE -->
            <div class="mb-2">
                <label class="form-label">Credential Type</label>
                <select
                v-model="cred.credential_type"
                class="form-select"
                required
                >
                <option value="" disabled>Select type</option>
                <option value="drivers_license">Driver’s License</option>
                <option value="prc_license">PRC License</option>
                <option value="tesda_certificate">TESDA Certificate</option>
                <option value="training_certificate">Training Certificate</option>
                <option value="other">Other</option>
                </select>
            </div>

            <!-- VALUE -->
            <div class="mb-2">
                <label class="form-label">Credential Value</label>
                <input
                v-model="cred.value"
                type="text"
                class="form-control"
                placeholder="License / Certificate No."
                required
                />
            </div>

            <!-- DATES -->
            <div class="row">
                <div class="col-md-6 mb-2">
                <label class="form-label">Date Acquired</label>
                <input
                    v-model="cred.acquire_on_date"
                    type="date"
                    class="form-control"
                    required
                />
                </div>

                <div class="col-md-6 mb-2">
                <label class="form-label">Expiration Date</label>
                <input
                    v-model="cred.expire_on_date"
                    type="date"
                    class="form-control"
                />
                </div>
            </div>

            <!-- ACTIVE -->
            <div class="form-check mb-2">
                <input
                v-model="cred.is_active"
                type="checkbox"
                class="form-check-input"
                :id="`cred-active-${index}`"
                />
                <label
                class="form-check-label"
                :for="`cred-active-${index}`"
                >
                Active
                </label>
            </div>

            <!-- REMOVE -->
            <button
                v-if="credentials.length > 1"
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removeCredential(index)"
            >
                <i class="bi bi-trash me-1"></i>
                Remove Credential
            </button>

            </div>

            <button
            type="button"
            class="btn btn-sm btn-outline-plum"
            @click="addCredential"
            >
            <i class="bi bi-plus-circle me-1"></i>
            Add Credential
            </button>


          <!-- ACTIONS -->
          <div class="d-flex gap-2 mt-2">
            <button
              type="submit"
              class="btn btn-outline-plum"
              :disabled="saving"
            >
              {{ saving ? 'Saving...' : 'Create Employee' }}
            </button>

            <button
              type="button"
              class="btn btn-outline-plum"
              @click="router.back()"
            >
              Cancel
            </button>
          </div>

        </form>

      </div>
    </div>

  </div>
</template>
