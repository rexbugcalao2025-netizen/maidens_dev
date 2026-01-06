<script setup>
    import { ref, computed, onMounted } from "vue"
    import api from "@/api"
    import { Notyf } from "notyf"

    const notyf = new Notyf()

    /* =======================
    PROPS / EMITS
    ======================= */
    const emit = defineEmits(["update"])

    /* =======================
    STATE
    ======================= */
    const services = ref([])
    const selectedServices = ref([])
    const search = ref("")
    const loading = ref(false)

    /* =======================
    LOAD SERVICES
    ======================= */
    const loadServices = async () => {
    try {
        loading.value = true
        // const res = await api.get("/services/active")
        const res = await api.get("/services/admin/all")
        services.value = (res.data ?? [])
            .filter(s => s.is_active)
            .sort((a, b) => a.name.localeCompare(b.name));

    } catch (err) {
        console.error(err)
        notyf.error("Failed to load services")
    } finally {
        loading.value = false
    }
    }

    /* =======================
    FILTERED SERVICES
    ======================= */
    const filteredServices = computed(() => {
    if (!search.value) return []

    const q = search.value.toLowerCase()
    return services.value.filter(s =>
        s.name.toLowerCase().includes(q)
    )
    })

    /* =======================
    ACTIONS
    ======================= */
    const addService = (service) => {
    const exists = selectedServices.value.find(
        s => s.service_id === service._id
    )

    if (exists) {
        notyf.error("Service already added")
        return
    }

    selectedServices.value.push({
        service_id: service._id,
        name: service.name,
        amount: service.total_price,
        person_assigned: [],
        notes: ""
    })

    emit("update", selectedServices.value)
    }

    const removeService = (serviceId) => {
    selectedServices.value = selectedServices.value.filter(
        s => s.service_id !== serviceId
    )

    emit("update", selectedServices.value)
    }

    /* =======================
    MOUNT
    ======================= */
    onMounted(loadServices)
</script>

<template>
  <div class="card mb-3">
    <div class="card-body">

      <h6 class="mb-3">Services Availed</h6>

      <!-- SEARCH -->
      <input
        v-model="search"
        class="form-control mb-3"
        placeholder="Search services..."
      />

      <!-- LOADING -->
      <div v-if="loading" class="text-muted small mb-2">
        Loading services...
      </div>

      <!-- SERVICE LIST -->
      <div
        v-if="filteredServices.length"
        class="list-group mb-3"
        style="max-height: 260px; overflow-y: auto"
      >
        <button
          v-for="s in filteredServices"
          :key="s._id"
          class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          @click="addService(s)"
        >
          <div>
            <div class="fw-semibold">{{ s.name }}</div>
            <small class="text-muted">
              {{ s.category?.name }}
              <span v-if="s.sub_category?.name">
                / {{ s.sub_category.name }}
              </span>
            </small>
          </div>

          <span class="fw-semibold">
            {{ s.total_price.toLocaleString() }} Php
          </span>
        </button>
      </div>

      <!-- NO SERVICES -->
      <div v-if="!filteredServices.length && !loading" class="text-muted small">
        No services found
      </div>

      <!-- SELECTED SERVICES -->
      <div v-if="selectedServices.length" class="mt-4">
        <h6 class="mb-2">Selected Services</h6>

        <table class="table table-sm">
          <thead>
            <tr>
              <th>Service</th>
              <th class="text-end">Amount</th>
              <th style="width:60px"></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in selectedServices"
              :key="s.service_id"
            >
              <td>{{ s.name }}</td>
              <td class="text-end">
                {{ s.amount.toLocaleString() }} Php
              </td>
              <td class="text-end">
                <button
                  class="btn btn-sm btn-outline-danger"
                  @click="removeService(s.service_id)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  </div>
</template>

<style scoped>
    .list-group-item-action:hover {
    background-color: #f8e6f0;
    }
</style>
