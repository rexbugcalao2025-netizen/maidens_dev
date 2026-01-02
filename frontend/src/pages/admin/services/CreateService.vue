<script setup>
    import { ref, onMounted, watch, computed } from "vue"
    import { useRouter } from "vue-router"
    import api from "@/api"
    import { Notyf } from "notyf"

    const router = useRouter()
    const notyf = new Notyf()

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
    FILTER STATE (PRODUCTS)
    ======================= */
    const filterProductCategory = ref("")
    const filterProductSubCategory = ref("")

    /* =======================
    SERVICE FORM
    ======================= */
    const form = ref({
        name: "",
        category_id: "",
        sub_category_id: "",
        description: "",
        price: null,
        labor_price: null,
        duration_minutes: null,
        date_offered: "",
        date_ended: "",
        materials: [] // { product_id, quantity, price, subTotal }
    })

    /* =======================
    TEMP PRODUCT SELECTION
    ======================= */
    const selectedProductId = ref("")
    const selectedQuantity = ref(1)

    /* =======================
    LOADERS
    ======================= */
    const loadServiceCategories = async () => {
        const res = await api.get("/service-categories")
        serviceCategories.value = res.data ?? []
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
    WATCHERS — SERVICE
    ======================= */
    watch(
    () => form.value.category_id,
        (catId) => {
            const cat = serviceCategories.value.find(c => c._id === catId)
            serviceSubcategories.value = cat ? cat.sub_categories : []
            form.value.sub_category_id = ""
        }
    )

    /* =======================
    WATCHERS — PRODUCT FILTER
    ======================= */
    watch(filterProductCategory, (catId) => {
        const cat = productCategories.value.find(c => c._id === catId)
        productSubCategories.value = cat ? cat.sub_categories : []
        filterProductSubCategory.value = ""
        selectedProductId.value = ""
    })

    watch(filterProductSubCategory, () => {        
        selectedProductId.value = ""
    })

    /* =======================
    WATCHERS — MATERIALS SUB TOTAL
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

    /* =======================
    COMPUTED — FILTERED PRODUCTS
    ======================= */
    const filteredProducts = computed(() => {
        return products.value.filter(p => {

             // 🚫 exclude archived products
            if (p.is_deleted) return false

            const matchCategory =
            !filterProductCategory.value ||
            p.category?._id === filterProductCategory.value

            const matchSubCategory =
            !filterProductSubCategory.value ||
            p.sub_category === filterProductSubCategory.value

            return matchCategory && matchSubCategory
        })
    })

    /* =======================
    COMPUTED — ENABLE / DISABLE SAVE BUTTON
    ======================= */
    const isValid = computed(() => {
    return (
        form.value.name?.trim() &&
        form.value.category_id &&
        Number(form.value.price) > 0 &&
        Number(form.value.labor_price) > 0 &&
        Number(form.value.duration_minutes) > 0 &&
        form.value.date_offered &&
        form.value.materials.length > 0
    )
    });

    /* =======================
    PRODUCT HELPERS
    ======================= */
    const productName = (id) =>
    products.value.find(p => p._id === id)?.name || "Unknown"

    const productUnitPrice = (id) =>
    products.value.find(p => p._id === id)?.price ?? 0

    const productTotalPrice = (item) =>
    productUnitPrice(item.product_id) * item.quantity

    /* =======================
    PRODUCTS USED
    ======================= */
    const addProduct = () => {
        if (!selectedProductId.value || selectedQuantity.value <= 0) return

        const exists = form.value.materials.find(
            p => p.product_id === selectedProductId.value
        )

        if (exists) {
            exists.quantity += selectedQuantity.value
        } else {
            form.value.materials.push({
            product_id: selectedProductId.value,
            quantity: selectedQuantity.value
            })
        }

        const price = products.price;
        const quantity = selectedQuantity.value;

        form.value.materials.push({
            product_id: products._id,
            quantity,
            price,
            subtotal: price * quantity
        });

        selectedProductId.value = ""
        selectedQuantity.value = 1
    }

    const removeProduct = (productId) => {
        form.value.materials = form.value.materials.filter(
            p => p.product_id !== productId
        )
    }

    /* =======================
    TOTAL MATERIAL COST
    ======================= */
    const totalMaterialCost = computed(() =>
        form.value.materials.reduce((sum, item) => {
            return sum + productTotalPrice(item)
        }, 0)
    )

    /* =======================
    PRODUCT QUANTITY VALIDATOR
    ======================= */
    const validateQuantity = (item) => {
        if (!item.quantity || item.quantity < 1) {
            item.quantity = 1
            notyf.error("Quantity must be at least 1")
        }
    }

    /* =======================
    SUBMIT
    ======================= */
   const submitForm = async () => {
        try {
            const payload = {
            name: form.value.name,
            description: form.value.description,
            category_id: form.value.category_id,
            sub_category_id: form.value.sub_category_id,
            duration_in_minutes: form.value.duration_minutes,
            labor_price: form.value.labor_price,
            materials: form.value.materials
            }

            await api.post("/services", payload)

            notyf.success("Service created successfully")
            router.push("/admin/services")
        } catch (err) {
            console.error(err)
            notyf.error("Failed to create service")
        }
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
                    @click="submitForm"
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
            <label class="form-label">Service Price *</label>
            <input type="number" v-model="form.price" class="form-control" />
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
          </div>

          <div class="col-md-6">
            <label class="form-label">Service Sub-Category</label>
            <select v-model="form.sub_category_id" class="form-select">
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
            <label class="form-label">Duration (Minutes) *</label>
            <input
                type="number"
                min="1"
                v-model="form.duration_minutes"
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
        <h5 class="mt-4 mb-2">Required Materials</h5>
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
                @input="p.subtotal = p.quantity * p.price"
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
</style>