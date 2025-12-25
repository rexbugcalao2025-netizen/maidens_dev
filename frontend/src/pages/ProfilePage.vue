<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'
import notyf from '../utils/notyf'

/* ======================
   STATE
   ====================== */
const loading = ref(true)
const saving = ref(false)
const success = ref(false)
const error = ref(null)
const originalPhones = ref([])

const profile = ref({
  first_name: '',
  last_name: '',
  email: '',
  address: '',
  gender: '',
  date_of_birth: '',
  phones: []
})

/* ======================
   LOAD PROFILE
   ====================== */
onMounted(async () => {
  try {
    const res = await api.get('/users/me')

    profile.value = {
      first_name: res.data.first_name ?? '',
      last_name: res.data.last_name ?? '',
      email: res.data.email ?? '',
      address: res.data.address ?? '',
      gender: res.data.gender ?? '',
      date_of_birth: res.data.date_of_birth
        ? res.data.date_of_birth.substring(0, 10)
        : '',
      phones: res.data.phones || []
    }

    // 🔐 SNAPSHOT ORIGINAL PHONES (DEEP COPY)
    originalPhones.value = JSON.parse(
      JSON.stringify(profile.value.phones)
    )

  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Failed to load profile'
  } finally {
    loading.value = false
  }
})

/* ======================
   PHONE HELPERS
   ====================== */
const addPhone = () => {
  error.value = null
  profile.value.phones.push({
    type: 'mobile',
    value: ''
  })
}

const removePhone = (index) => {
  error.value = null
  profile.value.phones.splice(index, 1)
}

const phonesChanged = () => {
  return profile.value.phones.length !== originalPhones.value.length ||
    profile.value.phones.some((p, i) =>
      p.type !== originalPhones.value[i]?.type ||
      p.value !== originalPhones.value[i]?.value
    )
}

/* ======================
   SAVE PROFILE (PUT /users/me)
   ====================== */
const saveProfile = async () => {
  saving.value = true
//   success.value = false
  error.value = null

  // ❌ Block save if there is an invalid phone
  const hasInvalidPhone = profile.value.phones.some(p =>
  !p.value || !/^\d{7,15}$/.test(String(p.value).replace(/\D/g, ''))
    )

  if (hasInvalidPhone) {    
    notyf.error('Please enter a valid phone number (7–15 digits)')
    saving.value = false
    return
  }

  try {
    const payload = {
      first_name: profile.value.first_name,
      last_name: profile.value.last_name,
      address: profile.value.address
    }

    if (profile.value.gender) {
      payload.gender = profile.value.gender
    }

    if (profile.value.date_of_birth) {
      payload.date_of_birth = profile.value.date_of_birth
    }

    // 🔥 SEND PHONES IF ANY EXIST
    if (profile.value.phones.length > 0) {
      payload.phones = profile.value.phones.map(p => ({
      type: p.type,
      value: Number(String(p.value).replace(/\D/g, ''))
      }))
    }

    await api.put('/users/me', payload)

    // success.value = true
    notyf.success('Profile updated successfully')

  } catch (err) {
    // error.value =
    //   err.response?.data?.message ||
    //   'Failed to save profile'
    notyf.error(
    err.response?.data?.message ||
    'Failed to save profile'
    )

  } finally {
    saving.value = false
  }
}


</script>


<template>
  <div class="container mt-4 pt-5" style="max-width: 1000px;">    
    <!-- <div class="container mt-4 pt-5" style="max-width: 650px;">     -->
    <div v-if="loading" class="text-muted">
      Loading profile...
    </div>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="!loading && !error" class="card">
      <div class="card-body">
        <h3 class="mb-3 text-center">My Profile</h3>
        <hr />

        <!-- EMAIL (READ ONLY) -->
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input
            type="email"
            class="form-control"
            :value="profile.email"
            disabled
          />
        </div>

        <!-- FULL NAME -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">First Name</label>
            <input
              v-model="profile.first_name"
              type="text"
              class="form-control"
            />
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Last Name</label>
            <input
              v-model="profile.last_name"
              type="text"
              class="form-control"
            />
          </div>
        </div>

        <!-- ADDRESS -->
        <div class="mb-3">
          <label class="form-label">Address</label>
          <input
            v-model="profile.address"
            type="text"
            class="form-control"
          />
        </div>

        <!-- GENDER & DOB -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Gender</label>
            <select v-model="profile.gender" class="form-select">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label">Date of Birth</label>
            <input
              v-model="profile.date_of_birth"
              type="date"
              class="form-control"
            />
          </div>
        </div>

        <!-- PHONE NUMBERS -->
        <div class="mb-3">
        <label class="form-label d-flex justify-content-between">
            <span>Phone Numbers</span>
            <button
            type="button"
            class="btn btn-sm btn-outline-primary"
            @click="addPhone"
            >
            + Add
            </button>
        </label>

        <div
            v-for="(phone, index) in profile.phones"
            :key="phone._id || index"
            class="row g-2 mb-2"
        >
            <div class="col-md-4">
            <select v-model="phone.type" class="form-select">
                <option value="mobile">Mobile</option>
                <option value="home">Home</option>
                <option value="work">Work</option>
            </select>
            </div>

            <div class="col-md-6">
            <input
                v-model="phone.value"
                type="string"
                class="form-control"
                placeholder="Phone number"
            />
            </div>

            <div class="col-md-2 d-flex align-items-center">
            <button
                type="button"
                class="btn btn-outline-danger btn-sm"
                @click="removePhone(index)"
            >
                Remove
            </button>
            </div>
        </div>
        </div>


        <!-- SUCCESS MESSAGE -->
        <div v-if="success" class="alert alert-success">
            Profile updated successfully.
        </div>

        <!-- ERROR MESSAGE -->
        <div v-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <button
            class="btn btn-primary"
            :disabled="saving"
            @click="saveProfile">
         {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>

      </div>
    </div>
  </div>
</template>
