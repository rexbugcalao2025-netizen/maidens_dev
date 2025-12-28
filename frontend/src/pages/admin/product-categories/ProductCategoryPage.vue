<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '@/api';
import CategoryModal from './CategoryModal.vue';
import SubCategoryInlineEditor from './SubCategoryInlineEditor.vue';
import notyf from '../../../utils/notyf';

const categories = ref([]);
const showModal = ref(false);
const selectedCategory = ref(null);
const loading = ref(false);
const error = ref(null);
const selectedCategoryId = ref('');
const ARCHIVED_MODE = '__ARCHIVED__';

const loadCategories = async () => {
  loading.value = true;
  error.value = null;

  try {
    const res = await api.get('/product-categories');

    // sort alphabetically (case-insensitive)
    categories.value = res.data
      .filter(cat => cat && cat._id && cat.name)
      .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

  } catch (err) {
    error.value = 'Failed to load product categories';

  } finally {
    loading.value = false;
  }
}

const displayedCategories = computed(() => {
  const list = categories.value.filter(cat => cat && cat._id); 

  // Archived view
  if (selectedCategoryId.value === ARCHIVED_MODE) {    
    return list.filter(cat => cat.is_deleted === true);
  }

 // Single category
  if (selectedCategoryId.value) {
    return list.filter(cat => cat._id === selectedCategoryId.value);
  }

  // Default: active categories
  return list.filter(cat => !cat.is_deleted);
  
});

const openAdd = () => {
  selectedCategory.value = null;
  showModal.value = true;
};

const openEdit = (cat) => {
  selectedCategory.value = cat;
  showModal.value = true;
};

const archiveCategory = async (cat) => {
  if (!confirm('Archive this category?')) return;
  await api.delete(`/product-categories/${cat._id}`);
  loadCategories();
  notyf.success('Category archived successfully');
};

const restoreCategory = async (cat) => {
  await api.patch(`/product-categories/${cat._id}`);
  loadCategories();
  notyf.success('Category restored from archive');
};


onMounted(loadCategories);
</script>

<template>
  <div>
    <div class="d-flex justify-content-between my-4">
      <h4>Product Categories</h4>

      <!-- RIGHT: CATEGORY SELECT -->
      <div class="d-flex align-items-center gap-2">

        <!-- CATEGORY SELECT -->
        <span class="fw-semibold">Filter</span>
        <select
          class="form-select"
          style="min-width: 260px"
          v-model="selectedCategoryId"
        >
          <option value="">All Categories</option>

          <option
            v-for="cat in categories.filter(c => c.is_deleted === false)"
            :key="cat?._id"
            :value="cat?._id"
          >
            {{ cat?.name }}
          </option>
          <option disabled>──────────</option>
          <!-- ARCHIVED VIEW -->
          <option :value="ARCHIVED_MODE">
            Archived Categories
          </option>

        </select>

        <!-- RIGHT: ADD BUTTON -->
        <button class="btn btn-outline-plum " style="width: 200px" @click="openAdd">Add Category</button>

      </div>
      

    </div>

    <div v-for="cat in displayedCategories" :key="cat._id" class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <strong>{{ cat?.name }}</strong>
          <span v-if="cat.is_deleted" class="badge bg-secondary ms-2">
            Archived
          </span>
        </div>      
  
        <div  class="d-flex gap-1">          
          <!-- EDIT (ACTIVE ONLY) -->
          <button
            class="btn btn-sm btn-outline-plum"
            @click="openEdit(cat)"
            v-if="!cat.is_deleted"
          >
            Edit
          </button>

          <!-- ARCHIVE -->
          <button
            class="btn btn-sm btn-outline-plum"
            @click="archiveCategory(cat)"
            v-if="!cat.is_deleted"
          >
            Archive
          </button>

          <!-- RESTORE -->
          <button
            class="btn btn-sm btn-outline-plum"
            @click="restoreCategory(cat)"
            v-if="cat.is_deleted"
          >
            Restore
          </button>


        </div>
      </div>

      <div class="card-body" v-if="!cat.is_deleted">
        <SubCategoryInlineEditor
          :category="cat"
          @updated="loadCategories"
        />
      </div>

      <div v-else class="text-muted fst-italic">
        Restore category to manage subcategories.
      </div>

    </div>

    

    <CategoryModal
      v-if="showModal"
      :category="selectedCategory"
      @close="showModal = false"
      @saved="() => { showModal = false; loadCategories(); }"
    />
  </div>
</template>
