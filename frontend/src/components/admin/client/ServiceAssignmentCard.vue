<script setup>
    import { ref, watch } from "vue"

    /* =======================
    PROPS / EMITS
    ======================= */
    const props = defineProps({
    service: {
        type: Object,
        required: true
    },
    employees: {
        type: Array,
        required: true
    }
    })

    const emit = defineEmits(["update", "remove"])

    /* =======================
    LOCAL COPY (SAFE MUTATION)
    ======================= */
    const localService = ref(JSON.parse(JSON.stringify(props.service)))

    watch(
    () => props.service,
    (val) => {
        localService.value = JSON.parse(JSON.stringify(val))
    },
    { deep: true }
    )

    /* =======================
    EMPLOYEE ASSIGNMENT
    ======================= */
    const addEmployee = () => {
    localService.value.person_assigned.push({
        employee_id: "",
        percentage_commission: 0
    })
    emitUpdate()
    }

    const removeEmployee = (index) => {
    localService.value.person_assigned.splice(index, 1)
    emitUpdate()
    }

    /* =======================
    UPDATE EMIT
    ======================= */
    const emitUpdate = () => {
    emit("update", localService.value)
    }

    /* =======================
    REMOVE SERVICE
    ======================= */
    const removeService = () => {
    emit("remove", localService.value.service_id)
    }
</script>

<template>
  <div class="card mb-3">
    <div class="card-body">

      <!-- HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-2">
        <div>
          <h6 class="mb-0">{{ localService.name }}</h6>
          <small class="text-muted">
            {{ localService.amount.toLocaleString() }} Php
          </small>
        </div>

        <!-- <button
          class="btn btn-sm btn-outline-danger"
          @click="removeService"
        >
          <i class="bi bi-trash"></i>
        </button> -->
      </div>

      <!-- ASSIGNED EMPLOYEES -->
      <div class="mt-3">
        <label class="form-label fw-semibold">
            Assigned Personnel
        </label>       

        <div
          v-for="(p, index) in localService.person_assigned"
          :key="index"
          class="row g-2 align-items-center mb-2"
        >
          <div class="col-md-7">
            <select
              v-model="p.employee_id"
              class="form-select"
              @change="emitUpdate"
            >
              <option value="">Select employee</option>
              <option
                v-for="e in employees"
                :key="e._id"
                :value="e._id"
              >
                {{`${e.user?.full_name} |  ${e.employee_code} `}}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <input
              type="number"
              min="0"
              max="100"
              class="form-control"
              placeholder="%"
              v-model.number="p.percentage_commission"
              @input="emitUpdate"
            />
          </div>

          <div class="col-md-2 text-end">
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="removeEmployee(index)"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <button
          class="btn btn-sm btn-outline-plum mt-2 mx-1"
          @click="addEmployee"
        >
          <i class="bi bi-plus-circle me-1"></i>
          Add Personnel
        </button>
      </div>

      <!-- NOTES -->
      <div class="mt-3">
        <label class="form-label fw-semibold">Notes</label>
        <textarea
          v-model="localService.notes"
          class="form-control"
          rows="2"
          placeholder="Optional notes..."
          @input="emitUpdate"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
    .card {
    border-left: 4px solid #e6b3cc;
    }
</style>
