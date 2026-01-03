<script setup>
  import { ref, onMounted, watch, computed } from "vue"
  import api from "@/api"
  import { Notyf } from "notyf"
  import { useRouter } from "vue-router"

  const router = useRouter();
  const notyf = new Notyf()

  /* =======================
  PROPS / EMITS
  ======================= */
  const props = defineProps({
    modelValue: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits(["submit"])

  /* =======================
  LOCAL FORM STATE
  ======================= */
  const form = ref(structuredClone(props.modelValue))  
  // const form = ref({})

  // watch(
  //   () => props.modelValue,
  //   (val) => {
  //     if (!val) return
  //     form.value = JSON.parse(JSON.stringify(val))
  //   },
  //   { immediate: true }
  // )
  watch(
    () => props.modelValue,
    (val) => {
      form.value = structuredClone(val)
    },
    { deep: true }
  )

  /* =======================
  SERVICE CATEGORIES
  ======================= */
  const serviceCategories = ref([])
  const serviceSubcategories = ref([])

  /* =======================
  PRODUCT CATEGORIES
  ======================= */
  const productCategories = ref([])
  const productSubCategories = ref([])

  /* =======================
  PRODUCTS
  ======================= */
  const products = ref([])

  /* =======================
  FILTER STATE
  ======================= */
  const filterProductCategory = ref("")
  const filterProductSubCategory = ref("")

  /* =======================
  LOADERS
  ======================= */
  const loadServiceCategories = async () => {
    const res = await api.get("/service-categories")
    serviceCategories.value = (res.data ?? []).filter(c => !c.is_deleted)
  }

  const loadProductCategories = async () => {
    const res = await api.get("/product-categories")
    productCategories.value = res.data ?? []
  }

  const loadProducts = async () => {
    const res = await api.get("/products/admin/all")
    products.value = res.data ?? []
  }

  /* =======================
  WATCHERS
  ======================= */
  watch(
    () => form.value.category_id,
    (catId) => {
      const cat = serviceCategories.value.find(c => c._id === catId)
      serviceSubcategories.value = cat
        ? cat.sub_categories.filter(s => !s.is_deleted)
        : []
      form.value.sub_category_id = ""
    }
  )

  watch(filterProductCategory, (catId) => {
    const cat = productCategories.value.find(c => c._id === catId)
    productSubCategories.value = cat ? cat.sub_categories : []
    filterProductSubCategory.value = ""
  })

  /* =======================
  MATERIALS
  ======================= */
  watch(
    () => form.value.materials,
    (materials) => {
      materials.forEach(m => {
        m.subtotal = m.price * m.quantity
      })
    },
    { deep: true }
  )

  const totalMaterialCost = computed(() =>
    form.value.materials.reduce((sum, m) => sum + m.subtotal, 0)
  )

  /* =======================
  VALIDATION
  ======================= */
  const isValid = computed(() => {
    const hasLabor =
      Number(form.value.labor_price) > 0 &&
      Number(form.value.duration_in_minutes) > 0

    const hasMaterials =
      Array.isArray(form.value.materials) &&
      form.value.materials.length > 0

    return (
      form.value.name?.trim() &&
      form.value.category_id &&
      Number(form.value.total_price) > 0 &&
      form.value.date_offered &&
      (hasLabor || hasMaterials)
    )
  })

  const isBelowCost = computed(() =>
    Number(form.value.total_price) <
    (Number(form.value.labor_price) + totalMaterialCost.value)
  )

  /* =======================
  PRODUCT HELPERS
  ======================= */
  const addProduct = (product, qty = 1) => {
    const exists = form.value.materials.find(
      m => m.product_id === product._id
    )

    if (exists) {
      exists.quantity += qty
      exists.subtotal = exists.quantity * exists.price
    } else {
      form.value.materials.push({
        product_id: product._id,
        product_name: product.name,
        quantity: qty,
        price: product.price,
        subtotal: product.price * qty
      })
    }
  }

  const removeProduct = (id) => {
    form.value.materials = form.value.materials.filter(
      m => m.product_id !== id
    )
  }

  /* =======================
  SUBMIT
  ======================= */
  const submit = () => {
    if (!isValid.value) {
      notyf.error("Please complete required fields")
      return
    }
    emit("submit", structuredClone(form.value))
  }

  /* =======================
  MOUNT
  ======================= */
  onMounted(() => {
    loadServiceCategories()
    loadProductCategories()
    loadProducts()
  })
</script>


<template>
  <div class="container mt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h4>Create Service</h4>
        <!-- ACTION -->
        <div class="d-flex justify-content-end mt-2">

            <button class="d-flex btn btn-outline-plum justify-content-end" id="btn-back"  @click="router.back()">
                <i class="bi bi-arrow-left me-1"></i> Back
            </button>

            <button
              class="btn btn-outline-plum"
              :disabled="!isValid"
              @click="submit"
            >
              <i class="bi bi-save me-1"></i> Save Service
            </button>

        </div>

    </div>

    <div class="card">
      <div class="card-body">

        <!-- SERVICE INFO -->
        <div class="row g-3 mb-4">

          <div class="col-md-6">
            <label class="form-label">Service Name *</label>
            <input v-model="form.name" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Service Price* <span class="text-muted fw-normal">(total service price includes: labor, materials and profit)</span></label>
            <input 
                type="number" 
                v-model="form.total_price" 
                class="form-control" 
                :class="{ 'is-warning': isBelowCost }"
            />

            <!-- BELOW-COST WARNING -->
            <div
                v-if="isBelowCost"
                class="alert alert-warning py-1 px-2 mt-2 mb-0"
                style="font-size: 0.85rem"
            >
                ⚠️ Total price is below labor + material cost
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label">Service Category *</label>
            <select v-model="form.category_id" class="form-select">
              <option value="">Select</option>
              <option v-for="c in serviceCategories" :key="c._id" :value="c._id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="col-md-6">
            <label class="form-label">Labor Price *</label>
            <input type="number" v-model="form.labor_price" class="form-control" />
            <small class="text-muted">
                Required for labor-only services
            </small>
          </div>

          <div class="col-md-6">
            <label class="form-label">Service Sub-Category</label>
            <select
                v-model="form.sub_category_id"
                class="form-select"
                :disabled="serviceSubcategories.length === 0"
                >
              <option value="">Select</option>
              <option
                v-for="s in serviceSubcategories"
                :key="s._id"
                :value="s._id"
              >
                {{ s.name }}
              </option>
            </select>
          </div>

            <div class="col-md-6">
            <label class="form-label">Duration* <span class="text-muted">(in minutes)</span></label>
            <input
                type="number"
                min="1"
                v-model="form.duration_in_minutes"
                class="form-control"
                placeholder="e.g. 60"
            />
            </div>

          <div class="col-md-12">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Date Offered *</label>
            <input type="date" v-model="form.date_offered" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">
              Date Ended <span class="text-muted">(optional)</span>
            </label>
            <input type="date" v-model="form.date_ended" class="form-control" />
          </div>
        </div>

        <!-- REQUIRED MATERIALS -->
        <h6 class="mt-4 mb-2">
            Required Materials
            <span class="text-muted fw-normal">
                (optional — leave empty for labor-only services)
            </span>
        </h6>
        <hr />

        <div class="row g-2 mb-3">

            <!-- PRODUCT CATEGORY -->
            <div class="col-md-3">
                <label class="form-label">Product Category</label>
                <select v-model="filterProductCategory" class="form-select">
                <option value="">All</option>
                <option v-for="c in productCategories" :key="c._id" :value="c._id">
                    {{ c.name }}
                </option>
                </select>
            </div>

            <!-- PRODUCT SUB CATEGORY -->
            <div class="col-md-3">
                <label class="form-label">Product Sub-Category</label>
                <select v-model="filterProductSubCategory" class="form-select">
                <option value="">All</option>
                <option
                    v-for="s in productSubCategories"
                    :key="s._id"
                    :value="s._id"
                >
                    {{ s.name }}
                </option>
                </select>
            </div>

            <!-- PRODUCT -->
            <div class="col-md-3">
                <label class="form-label">Product</label>
                <select 
                    v-model="selectedProductId" 
                    class="form-select" 
                    :disabled="filteredProducts.length === 0">

                    <option value="">Select Product</option>
                    <option v-for="p in filteredProducts" :key="p._id" :value="p._id">
                        {{ p.name }}
                    </option>
                </select>
            </div>

            <!-- ADD BUTTON -->            
            <div class="col-md-3 d-flex justify-content-end py-3 mt-4">
                <button class="btn btn-outline-plum" @click="addProduct">
                    <i class="bi bi-plus-circle me-1"></i>
                    Add Product
                </button>
            </div>

        </div>

        

        <!-- MATERIALS TABLE -->
        <table
        v-if="form.materials.length"
        class="table table-sm table-bordered"
        >
        <thead>
            <tr>
            <th>Product</th>
            <th style="width:90px">Qty</th>
            <th style="width:140px">Unit Price</th>
            <th style="width:160px">Total Item Price</th>
            <th style="width:60px"></th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="p in form.materials" :key="p.product_id">
            <td>{{ productName(p.product_id) }}</td>
            <td style="width:90px">
            <input
                type="number"
                min="1"
                class="form-control form-control-sm"
                v-model.number="p.quantity"
                @change="validateQuantity(p)"
            />
            </td>
            <td>
                <input
                class="form-control form-control-sm"
                :value="productUnitPrice(p.product_id).toLocaleString() + ' Php'"
                readonly disabled
                />
            </td>
            <td>
                <input
                class="form-control form-control-sm fw-semibold bg-light"
                :value="productTotalPrice(p).toLocaleString() + ' Php'"
                readonly disabled
                />
            </td>
            <td class="text-center">
                <button
                class="btn btn-sm btn-outline-danger"
                @click="removeProduct(p.product_id)"
                >
                <i class="bi bi-trash"></i>
                </button>
            </td>
            </tr>
        </tbody>
        </table>

        <!-- TOTAL COST -->
        <div class="col-md-6 mt-3">
        <label class="form-label">Total Cost of Materials</label>
        <input
            class="form-control bg-light fw-semibold"
            :value="totalMaterialCost.toLocaleString() + ' Php'"
            readonly
        />
        </div>       

      </div>
    </div>
  </div>
</template>

<style scoped>
    #btn-back {
        padding-left: 20px;
        padding-right: 20px;
        margin-right: 5px
    }

    .is-warning {
        border-color: #ffc107;
    }
</style>