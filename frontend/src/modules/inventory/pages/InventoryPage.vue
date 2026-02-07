<!-- src/modules/inventory/pages/InventoryPage.vue -->

<script setup>
    import { ref, onMounted } from 'vue';
    import InventoryTable from '../components/InventoryTable.vue';
    import AdjustStockModal from '../components/AdjustStockModal.vue';
    import ConsumeStockModal from '../components/ConsumeStockModal.vue';
    import { fetchInventory } from '../services/inventory.api';

    const products = ref([]);
    const selectedProduct = ref(null);

    const showAdjust = ref(false);
    const showConsume = ref(false);

    async function loadInventory() {
    products.value = await fetchInventory();
    }

    function openAdjust(product) {
    selectedProduct.value = product;
    showAdjust.value = true;
    }

    function openConsume(product) {
    selectedProduct.value = product;
    showConsume.value = true;
    }

    onMounted(loadInventory);
</script>

<template>
  <div class="container-fluid p-4">
    <h3 class="mb-4">
      <i class="bi bi-box-seam me-2"></i>
      Inventory
    </h3>

    <InventoryTable
      :products="products"
      @adjust="openAdjust"
      @consume="openConsume"
    />

    <AdjustStockModal
      v-if="showAdjust"
      :product="selectedProduct"
      @close="showAdjust = false"
      @updated="loadInventory"
    />

    <ConsumeStockModal
      v-if="showConsume"
      :product="selectedProduct"
      @close="showConsume = false"
      @updated="loadInventory"
    />
  </div>
</template>

