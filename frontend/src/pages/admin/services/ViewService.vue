<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import api from "@/api"
import { Notyf } from "notyf"

const route = useRoute()
const router = useRouter()
const notyf = new Notyf()

/* =======================
STATE
======================= */
const service = ref(null)
const loading = ref(true)

/* =======================
LOAD SERVICE
======================= */
const loadService = async () => {
  try {
    const res = await api.get(`/services/${route.params.id}`)
    service.value = res.data
  } catch (err) {
    console.error(err)
    notyf.error("Failed to load service")
    router.push("/admin/services")
  } finally {
    loading.value = false
  }
}

/* =======================
COMPUTED
======================= */
const totalMaterialCost = computed(() => {
  if (!service.value?.materials) return 0
  return service.value.materials.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
})

const profit = computed(() => {
  if (!service.value) return 0
  return (
    service.value.total_price -
    service.value.labor_price -
    totalMaterialCost.value
  )
})

/* =======================
ARCHIVE
======================= */
const archiveService = async () => {
  if (!confirm("Archive this service?")) return

  try {
    await api.patch(`/services/${service.value._id}/archive`)
    notyf.success("Service archived")
    router.push("/admin/services")
  } catch (err) {
    console.error(err)
    notyf.error("Failed to archive service")
  }
}

/* =======================
MOUNT
======================= */
onMounted(loadService)
</script>

<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-secondary"></div>
    </div>

    <div v-else-if="service" class="card">
      <div class="card-body">

        <!-- HEADER -->
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4>{{ service.name }}</h4>

          <div>
            <button
              class="btn btn-outline-secondary me-2"
              @click="router.back()"
            >
              <i class="bi bi-arrow-left"></i> Back
            </button>

            <button
              class="btn btn-outline-plum me-2"
              v-if="service?._id"
              @click="router.push(`/admin/services/${service._id}/edit`)"
            >
              <i class="bi bi-pencil"></i> Edit
            </button>

            <button
              class="btn btn-outline-danger"
              @click="archiveService"
            >
              <i class="bi bi-trash"></i> Archive
            </button>
          </div>
        </div>

        <!-- BASIC INFO -->
        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <label class="form-label">Category</label>
            <div class="fw-semibold">
              {{ service.category?.name }}
              <span v-if="service.sub_category?.name">
                / {{ service.sub_category.name }}
              </span>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Duration</label>
            <div class="fw-semibold">
              {{ service.duration_in_minutes }} minutes
            </div>
          </div>

          <div class="col-md-12">
            <label class="form-label">Description</label>
            <div class="border rounded p-2 bg-light">
              {{ service.description || "—" }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Date Offered</label>
            <div class="fw-semibold">
              {{ new Date(service.date_offered).toLocaleDateString() }}
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Date Ended</label>
            <div class="fw-semibold">
              {{ service.date_ended
                ? new Date(service.date_ended).toLocaleDateString()
                : "—" }}
            </div>
          </div>
        </div>

        <!-- MATERIALS -->
        <h5 class="mt-4">Materials Used</h5>
        <hr />

        <table class="table table-sm table-bordered">
          <thead>
            <tr>
              <th>Product</th>
              <th style="width:100px">Qty</th>
              <th style="width:150px">Unit Price</th>
              <th style="width:150px">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="m in service.materials"
              :key="m.product_id"
            >
              <td>{{ m.product_name}}</td>
              <td>{{ m.quantity }}</td>
              <td>{{ m.price.toLocaleString() }} Php</td>
              <td>{{ (m.price * m.quantity).toLocaleString() }} Php</td>
            </tr>
          </tbody>
        </table>

        <!-- PRICING -->
        <div class="row g-3 mt-3">
          <div class="col-md-4">
            <label class="form-label">Labor Cost</label>
            <input
              class="form-control bg-light fw-semibold"
              :value="service.labor_price.toLocaleString() + ' Php'"
              readonly
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Material Cost</label>
            <input
              class="form-control bg-light fw-semibold"
              :value="totalMaterialCost.toLocaleString() + ' Php'"
              readonly
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Total Service Price</label>
            <input
              class="form-control bg-light fw-semibold"
              :value="service.total_price.toLocaleString() + ' Php'"
              readonly
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Estimated Profit</label>
            <input
              class="form-control fw-semibold"
              :class="profit < 0 ? 'border-danger text-danger' : 'border-success text-success'"
              :value="profit.toLocaleString() + ' Php'"
              readonly
            />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.border-success {
  border-color: #198754;
}

.border-danger {
  border-color: #dc3545;
}
</style>
