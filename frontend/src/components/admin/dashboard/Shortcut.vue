<script setup>
  defineProps({
    icon: String,
    label: String,
    to: {
      type: [String, Object],
      required: true
    }
  })
</script>

<template>

  <router-link
    :to="to"
    class="card shadow-sm shortcut text-decoration-none"
  >
    <div class="card-body d-flex align-items-center gap-3">
      <!-- Bootstrap Icon -->
       <i :class="['bi', icon, 'icon']"></i>

      <!-- Label -->
       <span class="label">{{ label }}</span>
    </div>

  </router-link>
</template>



<style scoped>
.shortcut {
  width: 190px;
  cursor: pointer;
  border-radius: 1rem;
}

.shortcut:hover {
  transform: translateY(-4px);
  transition: 0.2s ease;
}

.icon {
  font-size: 2.2rem;        /* BIG icon */
  color: #8b5cf6;           /* Four Maidens violet */
}

.label {
  font-size: 1rem;
  font-weight: 500;
}
</style>
