<!-- src/modules/inventory/components/StocksStatusBadge.vue -->

<script setup>
import { computed } from 'vue'

const props = defineProps({
  quantity: {
    type: Number,
    required: true
  }
})

const status = computed(() => {
  if (props.quantity === 0) return 'OUT'
  if (props.quantity <= 10) return 'LOW'
  return 'OK'
})
</script>

<template>
  <span
    class="px-2 py-1 rounded text-xs font-semibold"
    :class="{
      'bg-green-100 text-green-700': status === 'OK',
      'bg-yellow-100 text-yellow-700': status === 'LOW',
      'bg-red-100 text-red-700': status === 'OUT'
    }"
  >
    {{ status }}
  </span>
</template>