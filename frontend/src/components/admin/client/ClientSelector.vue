<script setup>
    import { ref, computed, onMounted, watch } from "vue"
    import api from "@/api"
    import { Notyf } from "notyf"

    const notyf = new Notyf()

    /* =======================
    PROPS / EMITS
    ======================= */
    const emit = defineEmits(["selected"])

    /* =======================
    STATE
    ======================= */
    const clients = ref([])
    const search = ref("")
    const selectedClient = ref(null)
    const loading = ref(false)

    /* =======================
    LOAD CLIENTS
    ======================= */
    const loadClients = async () => {
        try {
            loading.value = true

            const res = await api.get("/clients")
            const rawClients = Array.isArray(res.data) ? res.data : []

            clients.value = rawClients
            .filter(c => !c.is_deleted)
            .sort((a, b) =>
                (a.user?.full_name || "").localeCompare(b.user?.full_name || "")
            )

            console.log("clients.value:", clients.value)

        } catch (err) {
            console.error(err)
            notyf.error("Failed to load clients")
        } finally {
            loading.value = false
        }
    }

    /* =======================
    FILTERED CLIENTS
    ======================= */
    const filteredClients = computed(() => {

        if (!search.value) return []

        const q = search.value.toLowerCase()   

        return clients.value.filter(c =>
            c.client_code?.toLowerCase().includes(q) ||
            c.user?.full_name?.toLowerCase().includes(q)
        )
    })

    /* =======================
    ACTIONS
    ======================= */
    const selectClient = (client) => {

        selectedClient.value = client
        search.value = ""
        emit("selected", client)
    }

    const clearClient = () => {
        selectedClient.value = null
        search.value = ""
        emit("selected", null)
    }

    /* =======================
    MOUNT
    ======================= */
    onMounted(loadClients)
</script>

<template>
  <div class="card mb-3">
    <div class="card-body">

      <h6 class="mb-3">Client</h6>

      <!-- SELECTED CLIENT -->
      <div v-if="selectedClient" class="alert alert-light d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ selectedClient.user?.full_name }}</strong>
          <div class="text-muted small">
            Code: {{ selectedClient.client_code||"-" }}
          </div>
        </div>

        <button
          class="btn btn-sm btn-outline-secondary"
          @click="clearClient"
        >
          Change
        </button>
      </div>

      <!-- SEARCH INPUT -->
      <div v-else>
        <input
          v-model="search"
          class="form-control"
          placeholder="Search by client code or name..."
          autocomplete="off"
        />

        <!-- LOADING -->
        <div v-if="loading" class="text-muted small mt-2">
          Loading clients...
        </div>

        <!-- RESULTS -->
        <ul
          v-if="filteredClients.length"
          class="list-group list-group-flush mt-2"
          style="max-height: 220px; overflow-y: auto"
        >
          <li
            v-for="c in filteredClients"
            :key="c._id"
            class="list-group-item list-group-item-action"
            @click="selectClient(c)"
            style="cursor: pointer"
          >
            <div class="fw-semibold">{{ c.user.full_name }}</div>
            <small class="text-muted">Code: {{ c.client_code }}</small>
          </li>
        </ul>

        <!-- NO RESULTS -->
        <div
          v-if="search && !filteredClients.length && !loading"
          class="text-muted small mt-2"
        >
          No clients found
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
    .list-group-item-action:hover {
    background-color: #f8e6f0;
    }
</style>
