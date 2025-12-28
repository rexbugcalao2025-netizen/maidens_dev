<script setup>

import { ref, onMounted, computed, watch } from 'vue';
import api from '@/api';

import { useRouter } from "vue-router";
import ProductList from "@/components/products/ProductList.vue";

import notyf from '../../utils/notyf';

const router = useRouter();

const categories = ref([]);
const selectedCategoryId = ref('');
const subCategories = ref([]);
const selectedSubCategoryId = ref('');
const searchText = ref('');

const subCategoryMap = ref({});
const subCategoryList = ref([]);


const loading = ref(false);
const error = ref(null);


const loadCategories = async() => {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get('/product-categories');

    // sort alphabetically (case-sensitive)
    categories.value = res.data
      .filter( cat => cat && cat._id && cat.name)
      .sort((a,b) => 
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

  } catch (err){
    error.value = 'failed to load product categories';

  } finally {
    loading.value = false;
  }
}

const loadSubCategories = async (categoryId) => {

  // reset always
  subCategories.value = [];
  selectedSubCategoryId.value = '';

  if (!categoryId) return;

  try {
    const res = await api.get('/product-categories');

    // Find the selected category
    const selectedCategory = res.data.find(
      cat => cat._id === categoryId
    );

    // Extract its sub-categories
    subCategories.value = (selectedCategory?.sub_categories || [])
    .slice() // safe copy
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );  

  } catch (err) {
    console.error('Failed to load sub-categories', err);
  }

};

// placeholder for future product creation
function goToCreate() {
  alert("Create Product coming next 🚧");
  // later:
  router.push("/admin/products/new");
}

function editProduct(id) {
  router.push(`/admin/products/${id}`);
}

watch(selectedCategoryId, (newVal,  oldVal) => {  
  loadSubCategories(newVal);
});

onMounted(loadCategories);

</script>

<template>
  <div class="container-fluid my-4">

    <!-- PAGE HEADER -->
    <div class="d-flex justify-content-between align-items-start mb-3">
      <!-- LEFT -->
      <h3 class="mb-0">Products List</h3>

      <!-- RIGHT CONTROLS -->
      <div class="d-flex align-items-center gap-2">
        <!-- TOP ROW: FILTERS + BUTTON -->        

        <div class="d-flex align-items-center gap-2">
          <span class="fw-semibold">Filter</span>

        <!-- CATEGORY -->
        <select
          class="form-select"
          style="min-width: 220px"
          v-model="selectedCategoryId"
        >
          <option value="">All Categories</option>
          <option
            v-for="cat in categories.filter(c => !c.is_deleted)"
            :key="cat._id"
            :value="cat._id"
          >
            {{ cat.name }}
          </option>
        </select>

        <!-- SUB CATEGORY -->
        <select
          class="form-select"
          style="min-width: 220px"
          v-model="selectedSubCategoryId"
          :disabled="!selectedCategoryId || !subCategories.length"
        >
          <option value="">All Sub-categories</option>
          <option
            v-for="sub in subCategories"
            :key="sub._id"
            :value="sub._id"
          >
            {{ sub.name }}
          </option>
        </select>

        <span class="fw-semibold">Search</span>
        <!-- SECOND ROW: SEARCH -->
        <input
          type="text"
          class="form-control"
          style="min-width: 300px"
          placeholder="Search product name…"
          v-model="searchText"
        />

        <div >       

          <!-- ADD PRODUCT -->
          <button class="btn btn-outline-plum" style="min-width:150px" @click="goToCreate">
            Add Product
          </button>                                
        </div>

      </div>
    </div>      
  </div>

    <!-- PRODUCT LIST (SEPARATE ROW) -->
    <ProductList 
      :category-id="selectedCategoryId"
      :sub-category-id="selectedSubCategoryId"
      :search-text="searchText"
      @edit="editProduct"
    />

  </div>
</template>


<style scoped>
/* optional page-level styling */
</style>
