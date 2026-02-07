<!-- src/modules/inventory/components/AdjustStockModal.vue -->

<script setup>
    import { ref } from 'vue';
    import { adjustStock } from '../services/inventory.api';

    const props = defineProps({      
      product: { 
        type: Object,
        required: true
      }
    });

    const emit = defineEmits(['close', 'updated']);

    const type = ref('IN');
    const quantity = ref(0);
    const reference = ref('');

    async function submit() {
    await adjustStock({
        productId: props.product.product_id,
        type: type.value,
        quantity: Number(quantity.value),
        reference: reference.value || null
        })

        emit('updated');
        emit('close');
    }
</script>

<template>
  <div class="modal-backdrop-custom">
    <div class="modal-card">

      <!-- HEADER BAR -->
      <div class="modal-header-adjust">
        <i class="bi bi-sliders me-2"></i>
        Adjust Stock
      </div>

      <!-- BODY -->
      <div class="modal-body">

        <div class="mb-3">
          <div class="fw-semibold">{{ product.name }}</div>
          <div class="text-muted small">
            Current: <strong>{{ product.quantity }}</strong>
          </div>
        </div>

        <!-- Type -->
        <div class="mb-3">
          <label class="form-label">Adjustment Type *</label>
          <select v-model="type" class="form-select">
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </div>

        <!-- Quantity -->
        <div class="mb-3">
          <label class="form-label">Quantity *</label>
          <input
            type="number"
            class="form-control"
            v-model.number="quantity"
            min="1"
          />
        </div>

        <!-- Reference -->
        <div class="mb-3">
          <label class="form-label">Reference</label>
          <input
            class="form-control"
            placeholder="e.g. Supplier delivery, correction"
            v-model="reference"
          />
        </div>

      </div>

      <!-- ACTIONS -->
      <div class="modal-footer d-flex justify-content-end gap-2">
        <button
          class="btn btn-secondary"
          @click="$emit('close')"
        >
          Cancel
        </button>

        <button
          class="btn btn-primary"
          @click="submit"
          :disabled="quantity <= 0"
        >
          <i class="bi bi-check-circle me-1"></i>
          Confirm
        </button>
      </div>

    </div>
  </div>
</template>


<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
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

/* 🌸 Header bar (adjust = neutral / control) */
.modal-header-adjust {
  background: linear-gradient(135deg, #c77da7, #8e4b7c);
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
  background: #f7c6d9;
}
</style>
