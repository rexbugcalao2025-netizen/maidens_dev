<script setup>
import { onMounted, ref } from "vue";
import { getProducts, deleteProduct } from "@/api/products";
import { Notyf } from "notyf";

const products = ref([]);
const notyf = new Notyf();

async function loadProducts() {
  const res = await getProducts();
  products.value = res.data.filter(p => !p.is_deleted);
}

async function archiveProduct(id) {
  if (!confirm("Archive this product?")) return;
  await deleteProduct(id);
  notyf.success("Product archived");
  loadProducts();
}

onMounted(loadProducts);
</script>

<template>
  <div>
    <h3>Products</h3>

    <table class="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th style="text-align: left">Price</th>
          <th>Images</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="p in products" :key="p._id">
          <td>{{ p.name }}</td>
          <td>{{ p.category?.name }}</td>
          <td>₱{{ p.price }}</td>
          <td>{{ p.images.length }}</td>
          <td>
            <router-link :to="`/products/${p._id}`" class="btn btn-sm btn-primary">Edit</router-link>
            <button class="btn btn-sm btn-danger ms-2" @click="archiveProduct(p._id)">
              🗑
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
