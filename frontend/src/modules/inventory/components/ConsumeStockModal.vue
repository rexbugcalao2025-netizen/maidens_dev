<!-- src/modules/inventory/components/ConsumeStockModal.vue -->

<script setup>
import { ref } from 'vue'
import { consumeStock } from '../services/inventory.api'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const quantity = ref(1)
const reference = ref('Service usage')
const referenceId = ref(0);
const isSubmitting = ref(false)

async function submit () {
  if (quantity.value <= 0) return

  try {
    isSubmitting.value = true    

    await consumeStock({
      productId: props.product.product_id,
      quantity: Number(quantity.value),
      reference: reference.value || null,
      referenceId: referenceId.value || 0
    })

    emit('updated')
    emit('close')
  } catch (err) {
    console.error('Consume stock failed:', err)
    alert(err.response?.data?.message || 'Failed to consume stock')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop-custom">
    <div class="modal-card">

      <!-- HEADER BAR -->
      <div class="modal-header-consume">
        <i class="bi bi-dash-circle me-2"></i>
        Consume Stock
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <div class="mb-3">
          <div class="fw-semibold">{{ product.name }}</div>
          <div class="text-muted small">
            Available: <strong>{{ product.quantity }}</strong>
          </div>
        </div>

        <!-- Quantity -->
        <div class="mb-3">
          <label class="form-label">Quantity *</label>
          <input
            type="number"
            class="form-control"
            min="1"
            :max="product.quantity"
            v-model.number="quantity"
          />
        </div>

        <!-- Reference -->
        <div class="mb-3">
          <label class="form-label">Reference *</label>
          <input
            type="text"
            class="form-control"
            v-model="reference"
            placeholder="e.g. Service usage"
          />
        </div>

        <!-- Reference ID -->
        <div class="mb-3">
          <label class="form-label">Reference ID</label>
          <input
            type="text"
            class="form-control"
            v-model="referenceId"
            placeholder="e.g. Customer Service ID"
          />
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="modal-footer d-flex justify-content-end gap-2">
        <button
          class="btn btn-secondary"
          @click="$emit('close')"
          :disabled="isSubmitting"
        >
          Cancel
        </button>

        <button
          class="btn btn-danger"
          @click="submit"
          :disabled="isSubmitting || quantity <= 0"
        >
          <i class="bi bi-dash-circle me-1"></i>
          Consume
        </button>
      </div>

    </div>
  </div>
</template>


<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  overflow: hidden;
}

/* 🌸 Header bar */
.modal-header-consume {
  background: linear-gradient(135deg, #e85d8f, #b84c7a);
  color: #fff;
  padding: 12px 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* Body */
.modal-body {
  padding: 1.5rem;
}

/* Footer */
.modal-footer {
  padding: 0.75rem 1.5rem;
  background: #fde6ef;
}
</style>

