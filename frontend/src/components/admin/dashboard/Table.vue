<!-- src/components/admin/dashboard/Table.vue -->

<script setup>
defineProps({
  headers: Array
})
</script>


<template>
  <table class="table table-bordered table-sm text-center mb-0">
    <thead class="table-light">
      <tr>
        <th v-for="h in headers" :key="h">{{ h }}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td v-for="h in headers" :key="h">—</td>
      </tr>
    </tbody>
  </table>
</template>

