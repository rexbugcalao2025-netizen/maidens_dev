<!-- src/modules/inventory/components/InventoryTable.vue -->

<script setup>
    import StockStatusBadge from './StockStatusBadge.vue';

    defineProps({
    products: {
      type: Array,
      required: true
      }
    });

    defineEmits(['adjust', 'consume']);
</script>

<template>
  <div class="card">
    <div class="card-body p-0">
      <table class="table table-hover align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>
              <i class="bi bi-box me-1 text-secondary"></i>
              Product
            </th>

            <th>
              <i class="bi bi-tags me-1 text-secondary"></i>
              Category
            </th>            

            <th class="text-end">
              <i class="bi bi-123 me-1 text-secondary"></i>
              Stock
            </th>
            
            <th>
              <i class="bi bi-activity me-1 text-secondary"></i>
              Status
            </th>

            <th class="text-end"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="p in products" :key="p.product_id">
            <td>{{ p.name }}</td>
            <td class="text-muted">{{ p.category_name }} / {{ p.sub_category_name }}</td>
            <td class="text-end fw-bold">{{ p.quantity }}</td>

            <td>
              <StockStatusBadge
                :quantity="p.quantity"
                :reorder-level="p.reorder_level"
              />
            </td>

            <td class="text-end">
              <button
                class="btn btn-sm btn-outline-danger me-2"
                @click="$emit('consume', p)"
              >
                <i class="bi bi-dash-circle me-1"></i>
                Consume
              </button>

              <button
                class="btn btn-sm btn-outline-primary"
                @click="$emit('adjust', p)"
              >
                <i class="bi bi-sliders me-1"></i>
                Adjust
              </button>
            </td>
          </tr>

          <tr v-if="products.length === 0">
            <td colspan="5" class="text-center text-muted py-4">
              No inventory data
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
