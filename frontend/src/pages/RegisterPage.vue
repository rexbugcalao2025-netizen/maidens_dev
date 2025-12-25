<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

const form = ref({
  email: '',
  password: '',
  confirmPassword: ''
})

const error = ref(null)
const submitting = ref(false)

/* BASIC VALIDATIONS */
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
)

const passwordsMatch = computed(() =>
  form.value.password &&
  form.value.confirmPassword &&
  form.value.password === form.value.confirmPassword
)

const canSubmit = computed(() =>
  isEmailValid.value && passwordsMatch.value && !submitting.value
)

const submit = async () => {
  error.value = null

  if (!canSubmit.value) {
    error.value = 'Please fix the validation errors'
    return
  }

  submitting.value = true

  try {
    await auth.register({
      email: form.value.email,
      password: form.value.password
    })

    router.push('/login')
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Registration failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container mt-5 pt-5" style="max-width: 420px;">
    <h2 class="mb-3">Register</h2>

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
          Please enter a valid email address
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

      <!-- CONFIRM PASSWORD -->
      <div class="mb-3">
        <label class="form-label">Confirm Password</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': form.confirmPassword && !passwordsMatch }"
          required
        />
        <div class="invalid-feedback">
          Passwords do not match
        </div>
      </div>

      <!-- SUBMIT -->
      <button
        class="btn btn-primary w-100"
        :disabled="!canSubmit"
      >
        {{ submitting ? 'Registering...' : 'Register' }}
      </button>

    </form>
  </div>
</template>
