<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api';
import notyf from '@/utils/notyf';

const route = useRoute();
const router = useRouter();


/* FORM STATE */
const product = ref({
  name: '',
  description: '',
  price: '',
  category: '',
  sub_category: ''
});

/* CATEGORY DATA */
const categories = ref([]);
const subCategories = ref([]);

/* PRICE HISTORY */
const priceHistory = ref([]);
const originalPrice = ref(null);
const showPriceHistory = ref(false);

/* PRODUCT IMAGES */
const originalImages = ref([]);
const images = ref([]);
const newImageUrl = ref('');
const previewImage = ref(null);


const isPriceChanged = computed(() => {
  if (!isEditMode.value || originalPrice.value === null) return false;
  return Number(product.value.price) !== originalPrice.value;
});


/* DETERMINE EDIT MODE FROM ADD MODE */
const isEditMode = computed(() => !!route.params.id);
const isInitialized = ref(false);

/* LOAD CATEGORIES */
const loadCategories = async () => {
  try {
    const res = await api.get('/product-categories');
    categories.value = res.data.filter(c => !c.is_deleted);
  } catch (err) {
    notyf.error('Failed to load categories');
  }
};

/* LOAD SUB-CATEGORIES (embedded design) */
const loadSubCategories = async (categoryId) => {
  subCategories.value = [];  

  if (!categoryId) return;

  const res = await api.get('/product-categories');

  const selectedCategory = res.data.find(
    cat => cat._id === categoryId
  );

  subCategories.value = (selectedCategory?.sub_categories || [])
    .slice()
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
};

/* WATCH CATEGORY CHANGE */
watch(
  () => product.value.category,
  async (newVal, oldVal) => {
    // Ignore until form is fully initialized
    if (!isInitialized.value) return;

    if (!newVal || newVal === oldVal) return;

    product.value.sub_category = '';
    await loadSubCategories(newVal);
  }
);


/* LOAD PRODUCT - EDIT MODE */
const loadProduct = async () => {
  if (!isEditMode.value) return;

  try {
    const res = await api.get(`/products/${route.params.id}`);
    
    // Capture original price in Edit Mode
    originalPrice.value = Number(res.data.price);
    priceHistory.value = (res.data.price_history || [])
      .slice()
      .sort((a, b) => new Date(b.date_changed) - new Date(a.date_changed));

    // Capture images
    images.value = Array.isArray(res.data.images)
      ? [...res.data.images]
      :[];

    originalImages.value = [...images.value];

    // 1️⃣ Set basic fields
    product.value.name = res.data.name;
    product.value.description = res.data.description;
    product.value.price = res.data.price;

    // 2️⃣ Set category FIRST
    const category = res.data.category;
    product.value.category =
      typeof category === 'string'
        ? category
        : category?._id?.toString() || '';

    // 3️⃣ Load sub-categories for that category
    await loadSubCategories(product.value.category);

    // 4️⃣ NOW set sub-category (options already exist)
    const subCategory = res.data.sub_category;
    product.value.sub_category =
      typeof subCategory === 'string'
        ? subCategory
        : subCategory?.toString() || '';

    isInitialized.value = true;

  } catch (err) {
    console.error(err);
    notyf.error('Failed to load product');
    router.push('/admin/products');
  }
};

/* SUBMIT */
const submitForm = async () => {
  try {

    if(product.value.name === '' || product.value.price === '' || product.value.category === '' || product.value.sub_category === ''){
      notyf.error('A required field* is missing');
      return;
    }    

    // if (!newImageUrl.value.startsWith('http')) return;

    const newPrice = Number(product.value.price);
    const priceChanged = 
      isEditMode.value &&
      originalPrice.value !== null &&
      newPrice !== originalPrice.value;

    const payload = {
      name: product.value.name,
      description: product.value.description,
      price: Number(product.value.price),
      category: product.value.category?.toString(),
      sub_category: product.value.sub_category?.toString() || null,
      images: images.value
    };

    // ✅ Append price history ONLY if price changed
    if (priceChanged){
      payload.price_history = [
        {
          price: newPrice,
          date_changed: new Date()
        }
      ]
    };


    if (isEditMode.value) {
      // 1️⃣ Update product fields
      await api.put(`/products/${route.params.id}`, payload);

      // 2️⃣ Add new images ONLY
      const newImages = getNewImages();


      // DEBUG
      console.log('Code passed here: Add new Images');
      console.log(`/products/${route.params.id}/images`);
      console.log(newImages);

      if (newImages.length) {
        await api.put(`/products/${route.params.id}/images`, {
          images: newImages
        });
      }
      notyf.success('Product updated successfully');

    } else {

      // await api.post('/products', {
      //   ...payload,
      //   images: images.value
      // });

      const res = await api.post('/products', payload);

      await api.put(`/products/${res.data.product._id}/images`, {
        images: images.value
      });

      notyf.success('Product created successfully');
    }

    router.push('/admin/products');

  } catch (err) {
    console.error(err);
    notyf.error('Failed to save product');
  }
};

/* HELPERS */

// Price formatter helper
function formatPrice(value) {
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Add Images
function addImage() {
  const url = newImageUrl.value.trim();
  if (!url) return;

  if (images.value.includes(url)) {
    notyf.error('Image already exists');
    return;
  }

  if (!isValidImagePath(url)) {
    notyf.error('Invalid image path or URL');
    return;
  }

  images.value.push(url);
  newImageUrl.value = '';
}
// Remove Images
async function removeImage(index) {
  const removed = images.value[index];

  images.value.splice(index, 1);

  // Only persist immediately in edit mode
  if (!isEditMode.value) return;

  try {
    await api.put(`/products/${route.params.id}/images/replace`, {
      images: images.value
    });

    notyf.success('Image removed');

    // Keep originalImages in sync
    originalImages.value = [...images.value];

  } catch (err) {
    notyf.error('Failed to remove image');

    // rollback UI on failure
    images.value.splice(index, 0, removed);
  }
}

// Get new Images
function getNewImages() {
  return images.value.filter(
    img => !originalImages.value.includes(img)
  );
}

// Validate Image source path
function isValidImagePath(path) {
  return (
    path.startsWith('http') ||
    path.startsWith('/uploads/') ||
    path.startsWith('/images/')
  );
}

// Show image viewer
function showImage(img) {
  previewImage.value = img;
}

// Close image viewer
function closeImage() {
  previewImage.value = null;
}

onMounted(async () => {
  await loadCategories();

  if (isEditMode.value) {
    await loadProduct();
  }

  isInitialized.value = true;
});

</script>


<template>
  <div class="container-fluid my-4">

    <h3 class="mb-4">
      {{ isEditMode ? 'Edit Product' : 'Add New Product' }}
    </h3>

    <div class="card">
      <div class="card-body">

        <!-- NAME -->
        <div class="mb-3">
          <label class="form-label">Product Name *</label>
          <input
            type="text"
            class="form-control"
            v-model="product.name"
          />
        </div>

        <!-- DESCRIPTION -->
        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea
            class="form-control"
            rows="3"
            v-model="product.description"
          ></textarea>
        </div>

        <!-- PRICE -->
        <div class="mb-3">
          <label class="form-label">Price (Php) *</label>
          <input
            type="number"
            class="form-control"
            v-model="product.price"
          />
        </div>
        <div v-if="isPriceChanged" class="text-warning small mt-1">
          ⚠ Changing price will be recorded in price history
        </div>

        <!-- PRICE HISTORY (EDIT MODE ONLY) -->
         <div>
          <div
              v-if="isEditMode && priceHistory.length"
              class="d-flex justify-content-between align-items-center mt-4 cursor-pointer"
              @click="showPriceHistory = !showPriceHistory"
              style="user-select: none;"
            >

            <h6 class="text-muted mb-0">
              Price History ({{ priceHistory.length }})
            </h6>

            <span class="text-muted">
              {{ showPriceHistory ? '▲ Hide' : '▼ Show' }}
            </span>
          </div>

          <div
            v-if="showPriceHistory"
            class="mt-2"
          >

            <div class="table-responsive">
              <table class="table table-sm table-bordered align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="width: 60%">Date Changed</th>
                    <th class="text-end">Price</th>
                  </tr>
                </thead>

                <tbody>
                  <tr v-for="(ph, index) in priceHistory"
                    :key="index"
                    :class="{ 'table-warning': index === 0 }">
                    <td>
                      {{ new Date(ph.date_changed).toLocaleString() }}
                    </td>
                    <td class="text-end">
                      ₱{{ formatPrice(ph.price) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>  

        <!-- IMAGE MANAGER -->
        <div class="mt-4">
          <h6 class="text-muted mb-2">Product Images</h6>

          <!-- ADD IMAGE -->
          <div class="input-group mb-3">
            <input
              type="text"
              class="form-control"
              placeholder="Paste image URL here"
              v-model="newImageUrl"
            />
            <button class="btn btn-outline-primary" @click="addImage">
              Add
            </button>
          </div>

          <!-- IMAGE PREVIEW GRID -->
          <div v-if="images.length" class="row g-2">
            <div
              v-for="(img, index) in images"
              :key="index"
              class="col-6 col-md-3"
            >
              <div class="card h-100">
                <img
                  :src="img"
                  class="card-img-top"
                  style="object-fit: cover; height: 140px;"
                />
                <div class="card-body p-2 text-center d-flex gap-1 justify-content-center">
                  <button
                    class="btn btn-sm btn-outline-plum"
                    @click="showImage(img)"
                  >
                    View
                  </button>

                  <button
                    class="btn btn-sm btn-outline-plum"
                    @click="removeImage(index)"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-muted small">
            No images added yet.
          </div>
        </div>


        <!-- CATEGORY -->
        <div class="mb-3">
          <label class="form-label">Category *</label>
          <select
            class="form-select"
            v-model="product.category"
          >
            <option value="">Select category</option>
            <option
              v-for="cat in categories"
              :key="cat._id"
              :value="cat._id.toString()"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- SUB CATEGORY -->
        <div class="mb-3">
          <label class="form-label">Sub-category *</label>
          <select
            class="form-select"
            v-model="product.sub_category"
            :disabled="!product.category"
          >
            <option value="">None</option>
            <option
              v-for="sub in subCategories"
              :key="sub._id"
              :value="sub._id.toString()"
            >
              {{ sub.name }}
            </option>
          </select>
        </div>

        <!-- ACTIONS -->
        <div class="d-flex gap-2">
          <button class="btn btn-outline-plum" @click="submitForm">
            {{ isEditMode ? 'Update Product' : 'Save Product' }}
          </button>

          <button
            class="btn btn-secondary"
            @click="router.push('/admin/products')"
          >
            Cancel
          </button>

          <!-- IMAGE PREVIEW MODAL -->
          <div
            v-if="previewImage"
            class="image-modal-backdrop"
            @click.self="closeImage"
          >
            <div class="image-modal">
              <img
                :src="previewImage"
                alt="Full image"
              />

              <button
                class="btn btn-sm btn-outline-plum mt-3"
                @click="closeImage"
              >
                Close
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
  .image-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }

  .image-modal {
    background: #fff;
    padding: 16px;
    border-radius: 6px;
    max-width: 90vw;
    max-height: 90vh;
    text-align: center;
  }

  .image-modal img {
    max-width: 100%;
    max-height: 70vh;
    object-fit: contain;
  }
</style>