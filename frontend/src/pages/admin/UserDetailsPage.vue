<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import notyf from '../../utils/notyf'

const route = useRoute()
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get(`/users/${route.params.id}`)
    user.value = res.data
  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load user'
    )
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container-fluid pt-4">

    <h3 class="mb-4">
      <i class="bi bi-person-lines-fill me-2"></i>
      User Details
    </h3>

    <div v-if="loading" class="text-muted">
      Loading user...
    </div>

    <div v-else-if="user" class="card">
      <div class="card-body">

        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>Name:</strong> {{ user.full_name || '—' }}</p>
        <p><strong>Role:</strong> {{ user.is_admin ? 'Admin' : 'User' }}</p>
        <p><strong>Status:</strong> {{ user.is_deleted ? 'Inactive' : 'Active' }}</p>

      </div>
    </div>

  </div>
</template>
