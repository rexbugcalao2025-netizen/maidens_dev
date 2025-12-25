<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import notyf from '../utils/notyf'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: ''
})

const error = ref(null)
const submitting = ref(false)

const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
)

const canSubmit = computed(() =>
  isEmailValid.value && form.value.password && !submitting.value
)

const submit = async () => {
  error.value = null

  // ✅ Validate first
  if (!canSubmit.value) {
    error.value = 'Please enter a valid email and password'
    return
  }

  submitting.value = true

  try {
    await auth.login({
      email: form.value.email,
      password: form.value.password
    })

    // ✅ Role-based redirect
    if (auth.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
    notyf.success('Login successful')
    
  } catch (err) {
    // ✅ Properly handled error
     notyf.error(
      err.response?.data?.message ||
      'Invalid email or password'
    )
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <div class="container mt-5 pt-5" style="max-width: 420px;">
    <h2 class="mb-3">Login</h2>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <form @submit.prevent="submit" novalidate>

      <!-- EMAIL -->
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': form.email && !isEmailValid }"
          required
        />
        <div class="invalid-feedback">
          Please enter a valid email
        </div>
      </div>

      <!-- PASSWORD -->
      <div class="mb-3">
        <label class="form-label">Password</label>
        <input
          v-model="form.password"
          type="password"
          class="form-control"
          required
        />
      </div>

      <button
        class="btn btn-primary w-100"
        :disabled="!canSubmit"
      >
        {{ submitting ? 'Logging in...' : 'Login' }}
      </button>

    </form>
  </div>
</template>
