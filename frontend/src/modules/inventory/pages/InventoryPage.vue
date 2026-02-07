<!-- src/modules/inventory/pages/InventoryPage.vue -->

<script setup>
    import { ref, onMounted, computed } from 'vue';
    import InventoryTable from '../components/InventoryTable.vue';
    import AdjustStockModal from '../components/AdjustStockModal.vue';
    import ConsumeStockModal from '../components/ConsumeStockModal.vue';
    import { fetchInventory } from '../services/inventory.api';

    const products = ref([]);
    const selectedProduct = ref(null);

    const showAdjust = ref(false);
    const showConsume = ref(false);

    // 🔍 SEARCH
  const search = ref('');

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

    // ✅ FILTERED VIEW
    const filteredProducts = computed(() => {
      
      if (!search.value) {
        return products.value;
      }

      const q = search.value.toLocaleLowerCase();

      return products.value.filter(p =>
        p.name?.toLocaleLowerCase().includes(q) ||
        p.category_name?.toLocaleLowerCase().includes(q) ||
        p.sub_category_name?.toLocaleLowerCase().includes(q)
      );
    });

    onMounted(loadInventory);
</script>

<template>
  <div class="container-fluid p-4">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="mb-0">
        <i class="bi bi-box-seam me-2"></i>
        Inventory
      </h3>  

      <!-- 🔍 SEARCH BOX -->
       <div class="input-group" style="max-width: 320px;">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input 
            type="text"
            class="form-control"
            placeholder="Search product, category"
            v-model="search"
          />

       </div>
    </div>  

    <InventoryTable
      :products="filteredProducts"
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

