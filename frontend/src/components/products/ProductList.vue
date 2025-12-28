<script setup>
import { ref, onMounted, watch } from "vue";
import api from "@/api";
import { Notyf } from "notyf";
import { formatCurrency } from '@/utils/format';

const products = ref([]);
const filteredProducts = ref([]);
const subCategoryMap = ref({});
const subCategoryList = ref([]);

const loading = ref(false);

const notyf = new Notyf();

const props = defineProps({
  categoryId: String,
  subCategoryId: String,
  searchText: String
});

async function loadProducts() {
  const res = await api.get('/products');
  products.value = res.data.filter(p => !p.is_deleted);

  buildSubCategoryMap(products.value);
  applyFilter();
}

async function buildSubCategoryMap() {
    try {
        const res = await api.get('/product-categories');

        const map = {};
        const list = [];

        res.data.forEach(cat => {
        if (Array.isArray(cat.sub_categories)) {

            // ✅ SORT sub-categories alphabetically by name
            const sortedSubs = [...cat.sub_categories].sort((a, b) =>
            a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            );

            sortedSubs.forEach(sub => {
                map[sub._id] = sub.name;
                list.push(sub); // 👈 already sorted
            });
        }
        });

    subCategoryMap.value = map;
    subCategoryList.value = list;

    } catch (err) {
        console.error('Failed to build sub-category map', err);
    }
}

async function archiveProduct(id) {
  if (!confirm("Archive this product?")) return;

  try {
    await api.delete(`/products/${id}`);
    notyf.success("Product archived");
    loadProducts();
  } catch (err) {
    console.error(err);
    notyf.error("Failed to archive product");
  }
}

function applyFilter(){
    let list = [...products.value];

    // CATEGORY
    if (props.categoryId) {
        list = list.filter(p =>
        p.category?._id === props.categoryId ||
        p.category === props.categoryId
        );
    }

    // SUB CATEGORY
    if (props.subCategoryId) {
        list = list.filter(p =>
        p.sub_category?._id === props.subCategoryId ||
        p.sub_category === props.subCategoryId
        );
    }

    // SEARCH
    if (props.searchText) {
        const q = props.searchText.toLowerCase();
        list = list.filter(p =>
        p.name.toLowerCase().includes(q)
        );
    }

    // DEBUG
    // list.forEach(item => {console.log(item.category?.name)});

  filteredProducts.value = list;
}

watch(() => [props.categoryId, props.subCategoryId, props.searchText], applyFilter);
onMounted(() => { loadProducts(); buildSubCategoryMap(); });
</script>

<template>
  <div>
    <div v-if="loading" class="text-muted">Loading products...</div>

    <table v-else class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Sub-category</th>
          <th>Price</th>          
          <th class="text-end">Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="product in filteredProducts" :key="product._id">
          <td>{{ product.name }}</td>
          <td>{{ product.category?.name || "—" }}</td>
          <td>{{ subCategoryMap[product.sub_category] || '—' }}</td>
          <td style="text-align: right;">{{ formatCurrency(product.price) }} Php</td>
          <td class="text-end">
            <button
              class="btn btn-sm btn-outline-plum me-2"
              @click="$emit('edit', product._id)"
            >
              Edit
            </button>

            <button
              class="btn btn-sm btn-outline-danger"
              @click="archiveProduct(product._id)"
            >
              🗑
            </button>
          </td>
        </tr>

        <tr v-if="!products.length">
          <td colspan="5" class="text-center text-muted">
            No products found.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
table td {
  vertical-align: middle;
}
</style>
