<script setup>
import { ref, onMounted } from "vue";
import { createProduct, updateProduct } from "@/api/products";
import { useRoute, useRouter } from "vue-router";
import api from "@/api";
import ProductPriceHistory from "@/components/products/ProductPriceHistory.vue";

const route = useRoute();
const router = useRouter();

const isEdit = !!route.params.id;

const product = ref({
  name: "",
  description: "",
  price: 0,
  category: "",
  sub_category: ""
});

const originalPrice = ref(0);

const categories = ref([]);
const subCategories = ref([]);

async function loadCategories() {
  const res = await api.get("/categories");
  categories.value = res.data;
}

async function loadProduct() {
  if (!isEdit) return;
  const res = await api.get(`/products/${route.params.id}`);
  product.value = res.data;
  originalPrice.value = res.data.price;
}

async function saveProduct() {
  if (isEdit) {
    await updateProduct(route.params.id, product.value);
  } else {
    await createProduct(product.value);
  }
  router.push("/products");
}

onMounted(() => {
  loadCategories();
  loadProduct();
});
</script>

<template>
  <div class="my-4">
    <h3>{{ isEdit ? "Edit Product" : "New Product" }}</h3>

    <input v-model="product.name" class="form-control mb-2" placeholder="Product name" />
    <textarea v-model="product.description" class="form-control mb-2" placeholder="Description" />
    <input type="number" v-model="product.price" class="form-control mb-2" placeholder="Price" />

    <select v-model="product.category" class="form-control mb-2">
      <option disabled value="">Select category</option>
      <option v-for="c in categories" :key="c._id" :value="c._id">
        {{ c.name }}
      </option>
    </select>

    <!-- Warning when price changes -->
    <div
      v-if="isEdit && product.price !== originalPrice"
      class="alert alert-warning py-2"
    >
      ⚠️ Changing the price will create a new price history record.
    </div>

    <button class="btn btn-outline-plum" @click="saveProduct">
      Save
    </button>

    <!-- Price history -->
    <ProductPriceHistory
      v-if="isEdit"
      :price="product.price"
      :history="product.price_history"
    />
    
  </div>
</template>
