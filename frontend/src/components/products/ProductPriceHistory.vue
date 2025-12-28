<script setup>
import { computed } from "vue";

const props = defineProps({
  price: {
    type: Number,
    required: true
  },
  history: {
    type: Array,
    default: () => []
  }
});

const sortedHistory = computed(() =>
  [...props.history].sort(
    (a, b) => new Date(b.date_changed) - new Date(a.date_changed)
  )
);

function formatDate(date) {
  return new Date(date).toLocaleString();
}
</script>

<template>
  <div class="mt-4">
    <h5 class="mb-2">Price History</h5>

    <div v-if="!history.length" class="text-muted fst-italic">
      No price changes recorded.
    </div>

    <table v-else class="table table-sm table-bordered">
      <thead class="table-light">
        <tr>
          <th>Date Changed</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in sortedHistory" :key="h._id">
          <td>{{ formatDate(h.date_changed) }}</td>
          <td>₱{{ h.price.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
