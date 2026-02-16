<!-- src/components/admin/dashboard/Panel.vue -->
 
 <script setup>
import { ref } from 'vue';

defineProps({
  title: String,
  subtitle: String,
  defaultOpen: {
    type: Boolean,
    default: true
  }
})

const open = ref(true);

open.value = open.value = true;

const toggle = () => {
  open.value = !open.value
}
</script>

<template>
  <div class="card shadow-sm rounded-4">
    <!-- Header -->
    <div
      class="card-header bg-white d-flex justify-content-between align-items-center panel-header"
      role="button"
      :aria-expanded="open"
      @click="toggle"
    >
      <div>
        <h5 class="mb-0">{{ title }}</h5>
        <small v-if="subtitle" class="text-muted">
          {{ subtitle }}
        </small>
      </div>

      <!-- Chevron Icon -->
      <i
        class="bi"
        :class="open ? 'bi-chevron-up' : 'bi-chevron-down'"
      ></i>
    </div>

    <!-- Collapsible Body -->
    <div class="collapse" :class="{ show: open }">
      <div class="card-body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel-header {
  cursor: pointer;
}

.panel-header:hover {
  background-color: #f9fafb;
}

.bi {
  font-size: 1.2rem;
  color: #8b5cf6; /* Four Maidens violet */
}
</style>
