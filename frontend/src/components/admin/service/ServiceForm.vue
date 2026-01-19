<script setup>
  import { ref, watch, computed, onMounted } from "vue";
  import { useRouter } from "vue-router";
  import api from "@/api";
  import { Notyf } from "notyf";

  const notyf = new Notyf();
  const router = useRouter();
  const isInitializing = ref(true); // initialization flag

  /* =======================
  PROPS / EMITS
  ======================= */
  const props = defineProps({
    modelValue: {
      type: Object,
      required: true
    },
    backTo: {
      type: String,
      default: "/admin/services"
    },
    mode: {
      type: String,
      default: "create" // or "edit"
    }
  })

  const emit = defineEmits(["submit"])

  /* =======================
  SAFE DEFAULT FORM
  ======================= */
  const emptyForm = {
    name: "",
    description: "",
    category_id: "",
    sub_category_id: "",
    duration: 1,
    duration_unit: 'minute',
    labor_price: null,
    total_price: null, // kept for display only
    date_offered: "",
    date_ended: null,
    materials: []
  }

  const form = ref({ ...emptyForm })

  /* =======================
  EXTRACTING SUBCATEGORY
  ======================= */
  const populateSubcategories = async (catId) => {

    if(!catId){
      serviceSubcategories.value = [];
      return;
    }

    const res = await api.get(`/service-categories/${catId}`)
    serviceSubcategories.value = 
      (res.data?.sub_categories ?? []).filter(s=> !s.is_deleted);
    // const cat = serviceCategories.value.find(c => c._id === catId)
    // serviceSubcategories.value = cat
    //   ? cat.sub_categories.filter(s => !s.is_deleted)
    //   : []
  }

  /* =======================
  SYNC PROP → LOCAL FORM
  ======================= */
  watch(
    () => props.modelValue,
    async (val) => {
      if (!val) return;

      isInitializing.value = true;

      form.value = {
        ...emptyForm,
        ...JSON.parse(JSON.stringify(val)),
        category_id: val.category?.id || "",
        sub_category_id: val.sub_category?.id || "",
        materials: Array.isArray(val.materials) ? val.materials : [],
        date_offered: val.date_offered
        ? val.date_offered.substring(0, 10)
        : "",
      date_ended: val.date_ended
        ? val.date_ended.substring(0, 10)
        : null
      
      }

      // 🔥 ensure sub-categories are loaded BEFORE unlock
      if (form.value.category_id){
        await populateSubcategories(form.value.category_id)
      }

      isInitializing.value = false;
    },
    { immediate: true }
  )

  /* =======================
  LOOKUPS
  ======================= */
  const serviceCategories = ref([])
  const serviceSubcategories = ref([])

  /* =======================
  LOADERS
  ======================= */
  const loadServiceCategories = async () => {
    const res = await api.get("/service-categories");
    serviceCategories.value = (res.data ?? []).filter(c => !c.is_deleted);

    // 🔥 FIX: populate sub-categories if editing
    if (form.value.category_id) {
      populateSubcategories(form.value.category_id);
    }

  }

  watch(
    () => form.value.category_id, 
    async (catId, oldCatId) => {      

      if (isInitializing.value){
        await populateSubcategories(catId);      
        form.value.sub_category_id = '';
      }
      

    // only reset sub-category if user actually changed category
        if (oldCatId && catId !== oldCatId) {
          form.value.sub_category_id = "";
        }      

      // const cat = serviceCategories.value.find(c => c._id === catId)
      // serviceSubcategories.value = cat
      //   ? cat.sub_categories.filter(s => !s.is_deleted)
      //   : []
      // form.value.sub_category_id = ""
    }
  )

  /* =======================
  MATERIALS LOGIC
  ======================= */
  watch(
    () => form.value.materials,
    (materials = []) => {
      materials.forEach(m => {
        m.subtotal = Number(m.price || 0) * Number(m.quantity || 0)
      })
    },
    { deep: true }
  )

  const totalMaterialCost = computed(() =>
    Array.isArray(form.value.materials)
      ? form.value.materials.reduce((s, m) => s + (m.subtotal || 0), 0)
      : 0
  )

  /* =======================
  VALIDATION
  ======================= */
  const isValid = computed(() => {

    const hasDuration = 
      Number(form.value.duration) > 0 &&
      ['minute', 'hour', 'day'].includes(form.value.duration_unit);

    const hasLabor =
      Number(form.value.labor_price) > 0;

    const hasMaterials =
      Array.isArray(form.value.materials) &&
      form.value.materials.length > 0;

    return (
      form.value.name?.trim() &&
      form.value.category_id &&
      Number(form.value.total_price) > 0 &&
      form.value.date_offered &&
      (hasLabor || hasMaterials)
    );

  })

  const isBelowCost = computed(() =>
    Number(form.value.total_price) <
    (Number(form.value.labor_price || 0) + totalMaterialCost.value)
  )

  /* =======================
  ACTIONS
  ======================= */
  const removeMaterial = (index) => {
    form.value.materials.splice(index, 1)
  }

  const submit = () => {
    if (!isValid.value) {
      notyf.error("Please complete required fields")
      return
    }

    const payload = JSON.parse(JSON.stringify(form.value))

    // DEBUG
    console.log(payload);

    emit("submit", payload)
  }

  /* =======================
  MOUNT
  ======================= */
  onMounted(loadServiceCategories)
</script>



<template>
  <div class="container-fluid mt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <!-- TITLE LEFT -->
      <h4>Service Details</h4>

      <!-- ACTIONS (RIGHT) -->
      <div class="d-flex gap-1">
        <button
          class="btn btn-outline-plum"
          @click="router.push(backTo)"
        >
          ← Back
        </button>      

        <button
          class="btn btn-outline-plum"
          :disabled="!isValid"
          @click="submit"
        >
          💾 Save
        </button>
      </div>
    </div>

    <!-- BASIC INFO -->
    <div class="card mb-3">
      <div class="card-body">

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Service Name</label>
            <input v-model="form.name" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Date Offered</label>
            <input type="date" v-model="form.date_offered" class="form-control" />
          </div>

          <div class="col-md-6">
            <label class="form-label">Category</label>
            <!-- <select 
              v-model="form.category_id" 
              class="form-select"
              :disabled="mode === 'edit'"
              >
              <option value="">Select category</option>
              <option v-for="c in serviceCategories" :key="c._id" :value="c._id">
                {{ c.name }}
              </option>
            </select> -->
            <input               
              type="text"
              class="form-control"
              :value="form.category?.name || '-'"
              readonly>

            <small class="text-muted">
              NOTE: Category and sub-category cannot be changed once a service is created.
            </small>
          </div>

          <div class="col-md-6">
            <label class="form-label">Sub-category</label>
            <!-- <select
              v-model="form.sub_category_id"
              class="form-select"
              :disabled="mode === 'edit'"
            >
              <option value="">Select sub-category</option>
              <option
                v-for="s in serviceSubcategories"
                :key="s._id"
                :value="s._id"
              >
                {{ s.name }}
              </option>
            </select> -->
            <input 
              type="text"
              class="form-control"
              :value="form.sub_category?.name ||'-'"
              readonly>
          </div>
        
          <div class="col-md-12">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" rows="2" />
          </div>
        </div>

      </div>
    </div>

    <!-- PRICING -->
    <div class="card mb-3">
      <div class="card-body">

        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label">Labor Price</label>
            <input type="number" v-model.number="form.labor_price" class="form-control" />
          </div>

          <div class="col-md-4">
            <label class="form-label">Duration</label>

            <div class="d-flex gap-2">
              <input 
                type="number" 
                min="1"
                v-model.number="form.duration" 
                class="form-control" 
              />

              <select
                v-model="form.duration_unit"
                class="form-select"
              >
            
                <option value="minute">Minutes</option>
                <option value="hour">Hours</option>
                <option value="day">Days</option>
                
              </select>
            
            </div>
          </div>

          <div class="col-md-4">
            <label class="form-label">Total Price</label>
            <input type="number" v-model.number="form.total_price" class="form-control" />
          </div>
        </div>

        <div v-if="isBelowCost" class="alert alert-warning mt-3">
          ⚠️ Total price is below labor + materials cost
        </div>

      </div>
    </div>

    <!-- MATERIALS -->
    <div class="card mb-3" v-if="form.materials.length">
      <div class="card-body">

        <h6>Materials</h6>

        <table class="table table-sm">
          <thead>
            <tr>
              <th>Product</th>
              <th class="text-end">Qty</th>
              <th class="text-end">Price</th>
              <th class="text-end">Subtotal</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(m, i) in form.materials" :key="i">
              <td>{{ m.product_name || "—" }}</td>
              <td class="text-end">{{ m.quantity }}</td>
              <td class="text-end">{{ m.price }}</td>
              <td class="text-end">{{ m.subtotal }}</td>
              <td class="text-end">
                <button class="btn btn-sm btn-outline-danger" @click="removeMaterial(i)">
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

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