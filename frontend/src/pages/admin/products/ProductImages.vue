<script setup>
import { ref } from "vue";
import { addProductImages } from "@/api/products";
import { Notyf } from "notyf";

const props = defineProps({
  productId: String,
  existingImages: Array
});

const images = ref([...props.existingImages]);
const newImage = ref("");

const notyf = new Notyf();

async function addImage() {
  if (!newImage.value) return;

  images.value.push(newImage.value);
  await addProductImages(props.productId, images.value);
  newImage.value = "";
  notyf.success("Image added");
}

function removeImage(index) {
  images.value.splice(index, 1);
  addProductImages(props.productId, images.value);
}
</script>

<template>
  <div>
    <h5>Product Images</h5>

    <div class="d-flex gap-2 mb-2">
      <input v-model="newImage" class="form-control" placeholder="Image URL" />
      <button class="btn btn-primary" @click="addImage">Add</button>
    </div>

    <div class="d-flex gap-2 flex-wrap">
      <div v-for="(img, i) in images" :key="i" class="position-relative">
        <img :src="img" width="120" class="border rounded" />
        <button class="btn btn-sm btn-danger position-absolute top-0 end-0"
          @click="removeImage(i)">✕</button>
      </div>
    </div>
  </div>
</template>
