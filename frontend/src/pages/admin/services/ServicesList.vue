<script setup>
    import { ref, onMounted, computed, watch } from "vue";    
    import api from "@/api";
    import notyf from '@/utils/notyf';

    /* STATE */
    const services = ref([]);
    const categories = ref([]);
    const subCategories = ref([]);
    const filterSubCategory = ref("");
    const loadingSubCategories = ref(false);

    const search = ref("");
    const filterCategory = ref("");
    const filterStatus = ref("");

    /* PAGINATION */
    const currentPage = ref(1);
    const pageSize = ref(10);

    /* SORTING */
    const sortKey = ref("");      // e.g. "name", "price"
    const sortOrder = ref("asc"); // "asc" | "desc"

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
      } else {
        sortKey.value = key;
        sortOrder.value = "asc";
      }
      currentPage.value = 1;
    }


    /* LOADERS */
    const loadServices = async () => {
      try {
          const res = await api.get("/services/admin/all");
          services.value = res.data ?? [];        

      } catch {
          notyf.error("Failed to load services");
      }
    }

    const loadCategories = async () => {
      try {
          const res = await api.get("/service-categories");
          categories.value = (res.data ?? []).filter(c => !c.is_deleted);
      } catch {
          notyf.error("Failed to load categories");
      }
    }

    const loadSubCategoriesByCategory = async (categoryId) => {
      
      if(!categoryId) {
        subCategories.value=[];
        return;
      }

      loadingSubCategories.value = true;

      try {
        const res = await api.get(`/service-categories/${categoryId}`);      

        subCategories.value = (res.data?.sub_categories ?? [])
          .filter(sc => !sc.is_deleted);

      } catch {
        notyf.error('Failed to load sub-categories');
        subCategories.value = [];        

      } finally {
        loadingSubCategories.value = false;
      }

    }
    

    /* FILTERS */
    watch([search, filterStatus], () => {
      currentPage.value = 1
    })

    watch(pageSize, () => {
      currentPage.value = 1
    })

    watch(filterCategory, async (newCategory) => {
      filterSubCategory.value = '';
      currentPage.value = 1;

      if (!newCategory){
        subCategories.value = [];
        return;
      }

      await loadSubCategoriesByCategory(newCategory);
    })

  const filteredServices = computed(() => {      

      return services.value.filter(s => {
          const matchesSearch =
          !search.value ||
          s.name.toLowerCase().includes(search.value.toLowerCase());        

          const matchesCategory =
          !filterCategory.value ||
          s.category?.id === filterCategory.value;

          const matchesSubCategory = 
          !filterSubCategory.value ||
          s.sub_category?.id === filterSubCategory.value;

          const matchesStatus =
          !filterStatus.value ||
          (filterStatus.value === "active" && s.is_active) ||
          (filterStatus.value === "archived" && !s.is_active);

          return (matchesSearch && 
                  matchesCategory && 
                  matchesSubCategory &&
                  matchesStatus)
      })
    })

  const sortedServices = computed(() => {
    if (!sortKey.value) return filteredServices.value

    return [...filteredServices.value].sort((a, b) => {
      let aVal, bVal

      switch (sortKey.value) {
        case "name":
          aVal = a.name.toLowerCase()
          bVal = b.name.toLowerCase()
          break

        case "category":
          aVal = a.category?.name || ""
          bVal = b.category?.name || ""
          break

        case "price":
          aVal = a.total_price || 0
          bVal = b.total_price || 0
          break

        case "status":
          aVal = a.is_active ? 1 : 0
          bVal = b.is_active ? 1 : 0
          break

        default:
          return 0
      }

      if (aVal < bVal) return sortOrder.value === "asc" ? -1 : 1
      if (aVal > bVal) return sortOrder.value === "asc" ? 1 : -1
      return 0
    })
  })


    const paginatedServices = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value
      return sortedServices.value.slice(start, start + pageSize.value)
    })

    const totalPages = computed(() => {
    return Math.max(
        1,
        Math.ceil(filteredServices.value.length / pageSize.value)
    )
    })

  const formatDuration = (duration, unit) => {
    if (!duration || !unit) return "—"

    const labels = {
      minute: duration === 1 ? "min" : "mins",
      hour: duration === 1 ? "hr" : "hrs",
      day: duration === 1 ? "day" : "days"
    }

    return `${duration} ${labels[unit]}`
  }

    /* ACTIONS */
    // const archiveService = async (service) => {
    // if (!confirm(`Archive "${service.name}"?`)) return

    // try {
    //     await api.patch(`/services/${service._id}/archive`)
    //     notyf.success("Service archived")
    //     loadServices()
    // } catch {
    //     notyf.error("Failed to archive service")
    // }
    // }

    onMounted(() => {
      loadCategories();
      loadServices();
    })
</script>

<template>
  <div class="container-fluid mt-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Services</h4>

      <div class="d-flex gap-2 align-items-center">

        <!-- FILTER: CATEGORY -->
        <span class="fw-semibold"> Filter:</span>
        <select
          v-model="filterCategory"
          class="form-select form-select-sm"
          style="width: 200px"
        >
          <option value="">All Categories</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">
            {{ c.name }}
          </option>
        </select>

        <!-- FILTER: SUB-CATEGORY -->
         <select 
            v-model="filterSubCategory"
            class="form-select form-select-sm"
            style="width: 220px"
            :disabled="!filterCategory || loadingSubCategories"
         >
            <option value="">All Sub-Categories</option>
            <option 
              v-for="sc in subCategories"
              :key="sc._id"
              :value="sc._id"
            >
              {{ sc.name }}
            </option>
         </select>

        <!-- FILTER: STATUS -->
        <select
          v-model="filterStatus"
          class="form-select form-select-sm"
          style="width: 160px"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>

        <!-- SEARCH -->
        <span class="fw-semibold"> Search:</span>
        <input
          v-model="search"
          class="form-control form-control-sm"
          placeholder="Search services..."
          style="width: 250px"
        />

        <!-- ADD SERVICE -->
        <router-link
          to="/admin/services/create"
          class="btn btn-outline-plum btn-sm"
        >
          <i class="bi bi-plus-circle me-1"></i>
          Add Service
        </router-link>

      </div>
    </div>

    <!-- TABLE -->
    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th @click="toggleSort('name')" style="cursor:pointer">
                Name
                <i
                  v-if="sortKey === 'name'"
                  :class="sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                  class="ms-1"
                ></i>

              </th>

              <th @click="toggleSort('category')" style="cursor:pointer">
                Category
                <i
                  v-if="sortKey === 'category'"
                  :class="sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                  class="ms-1"
                ></i>
              </th>

              <th>
                Duration
              </th>

              <th class="text-end" @click="toggleSort('price')" style="cursor:pointer">
                Price
                <i
                  v-if="sortKey === 'price'"
                  :class="sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                  class="ms-1"
                ></i>
              </th>

              <th @click="toggleSort('status')" style="cursor:pointer">
                Status
                <i
                  v-if="sortKey === 'status'"
                  :class="sortOrder === 'asc' ? 'bi bi-caret-up-fill' : 'bi bi-caret-down-fill'"
                  class="ms-1"
                ></i>
              </th>

              <th class="text-end">Actions</th>
            </tr>
          </thead>


          <tbody>
            <tr v-if="paginatedServices.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                No services match your filters
              </td>
            </tr>

            <tr v-for="s in paginatedServices" :key="s._id">
              <td>{{ s.name }}</td>
              <td>
                {{ s.category?.name }}
                <span v-if="s.sub_category?.name" class="text-muted">
                  / {{ s.sub_category.name }}
                </span>
              </td>

              <td>
                {{ formatDuration(s.duration, s.duration_unit) }}
              </td>

              <td class="text-end">
                {{ (s.total_price ?? 0).toLocaleString() }} Php
              </td>

              <td>
                <span
                  class="badge"
                  :class="s.is_active ? 'bg-success': 'bg-secondary'"
                >
                  {{ s.is_active ? "Active" : "Archived" }}
                </span>
              </td>

              <td class="text-end">

              <!-- VIEW -->
                <router-link
                  :to="`/admin/services/${s._id}`"
                  class="btn btn-sm btn-outline-secondary me-2"
                  title="View Service"
                >
                  <i class="bi bi-eye"></i>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- FOOTER -->
    <div
      class="d-flex justify-content-between align-items-center mt-3"
      v-if="filteredServices.length > 0"
    >
      <div class="d-flex align-items-center gap-2">
        <small class="text-muted">Rows per page</small>
        <select
          v-model="pageSize"
          class="form-select form-select-sm"
          style="width: 80px"
        >
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
        </select>
      </div>

      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">            
            <button
              class="page-link"
              @click="currentPage = Math.max(1, currentPage - 1)"
            >
              ‹
            </button>
          </li>

          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: page === currentPage }"
          >
            <button class="page-link" @click="currentPage = page">
              {{ page }}
            </button>
          </li>

          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button
              class="page-link"
              @click="currentPage = Math.min(totalPages, currentPage + 1)"
            >
              ›
            </button>
          </li>
        </ul>
      </nav>
    </div>

  </div>
</template>
