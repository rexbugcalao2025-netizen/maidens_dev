<script setup>
    import { ref, computed, onMounted } from "vue"
    import { useRouter } from "vue-router"
    import api from "@/api"
    import { Notyf } from "notyf"

    import ClientSelector from "@/components/admin/client/ClientSelector.vue"
    import ServiceSelector from "@/components/admin/client/ServiceSelector.vue"
    import ServiceAssignmentCard from "@/components/admin/client/ServiceAssignmentCard.vue"

    const router = useRouter()
    const notyf = new Notyf()

    /* =======================
    STATE
    ======================= */
    const employees = ref([])

    const form = ref({
    client_id: "",
    date_rendered: new Date().toISOString().substring(0, 10),
    service_rendered: [],
    payment: [], // Phase 2
    total_amount: 0,
    payment_status: "unpaid"
    })

    /* =======================
    LOAD EMPLOYEES
    ======================= */
    const loadEmployees = async () => {
    try {
        const res = await api.get("/employees");
        employees.value = res.data ?? []
            .filter(e => e.date_retired === null)
            .filter(e => e.user?.is_admin === false)
            .filter(e => e.user?.is_deleted === false)
            .sort((a, b) => (a.user?.full_name || '').localeCompare(b.user?.full_name || ''));


        // DEBUG
        console.log('employees.value');
        console.log(employees.value);
    } catch (err) {
        console.error(err)
        notyf.error("Failed to load employees")
    }
    }

    /* =======================
    HANDLERS
    ======================= */
    const handleClientSelected = (client) => {
        form.value.client_id = client?._id || ""
    }

    const handleServicesUpdate = (services) => {
    form.value.service_rendered = services
    }

    const updateAssignedService = (updatedService) => {
        const index = form.value.service_rendered.findIndex(
        s => s.service_id === updatedService.service_id
    )

    if (index !== -1) {
        form.value.service_rendered[index] = updatedService
    }
    }

    const removeService = (serviceId) => {
    form.value.service_rendered = form.value.service_rendered.filter(
        s => s.service_id !== serviceId
    )
    }

    /* =======================
    TOTAL COMPUTATION
    ======================= */
    const totalAmount = computed(() => {
    return form.value.service_rendered.reduce(
        (sum, s) => sum + Number(s.amount || 0),
        0
    )
    })

    /* =======================
    VALIDATION
    ======================= */
    const isValid = computed(() => {
    return (
        form.value.client_id &&
        form.value.service_rendered.length > 0
    )
    })

    /* =======================
    SUBMIT
    ======================= */
    const submit = async () => {
    if (!isValid.value) {
        notyf.error("Please select client and services")
        return
    }

    try {
        const payload = {
        ...form.value,
        total_amount: totalAmount.value
        }

        await api.post("/client-services", payload)

        notyf.success("Client service recorded successfully")
        router.push("/admin/client-services")
    } catch (err) {
        console.error(err)
        notyf.error("Failed to save client service")
    }
    }

    /* =======================
    MOUNT
    ======================= */
    onMounted(loadEmployees)
</script>

<template>
  <div class="container-fluid mt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4>Client Services</h4>

      <button
        class="btn btn-outline-secondary"
        @click="router.back()"
      >
        <i class="bi bi-arrow-left"></i> Back
      </button>
    </div>

    <!-- CLIENT -->
    <ClientSelector @selected="handleClientSelected" />

    <!-- SERVICES -->
    <ServiceSelector @update="handleServicesUpdate" />

    <!-- ASSIGNMENTS -->
    <div v-if="form.service_rendered.length">
      <h6 class="mt-4 mb-2">Service Assignments</h6>

      <ServiceAssignmentCard
        v-for="s in form.service_rendered"
        :key="s.service_id"
        :service="s"
        :employees="employees"
        @update="updateAssignedService"
        @remove="removeService"
      />
    </div>

    <!-- SUMMARY -->
    <div
      v-if="form.service_rendered.length"
      class="card mt-4"
    >
      <div class="card-body d-flex justify-content-between align-items-center">
        <div>
          <h6 class="mb-0">Total Amount</h6>
          <strong class="fs-5">
            {{ totalAmount.toLocaleString() }} Php
          </strong>
        </div>

        <button
          class="btn btn-outline-plum"
          :disabled="!isValid"
          @click="submit"
        >
          <i class="bi bi-save me-1"></i>
          Save Transaction
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
    h6 {
    font-weight: 600;
    }
</style>
