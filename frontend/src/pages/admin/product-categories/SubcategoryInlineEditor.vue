<script setup>
import { ref } from 'vue';
import api from '@/api';
import notyf from '../../../utils/notyf';

const props = defineProps({
  category: Object
});

const emit = defineEmits(['updated']);

const newSub = ref('');

const addSubCategory = async () => {
  if (!newSub.value.trim()) return;

  await api.post(
    `/product-categories/${props.category._id}/sub`,
    { name: newSub.value }
  );

  notyf.success('Sub-category created');

  newSub.value = '';
  emit('updated');
};

const deleteSub = async (subId) => {
  if (!confirm('Remove sub-category?')) return;

  await api.delete(
    `/product-categories/${props.category._id}/sub/${subId}`
  );

  notyf.success('Sub-category deleted');

  emit('updated');
};
</script>

<template>
  <div>
    <h6>Sub Categories</h6>

    <ul class="list-group mb-2">
      <li
        v-for="sub in category.sub_categories"
        :key="sub._id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        {{ sub.name }}
        <button
          class="btn btn-sm btn-outline-secondary px-2"
          @click="deleteSub(sub._id)"
          :disabled="category.is_deleted"
          title="Remove sub-category"
        >
          <i class="bi bi-trash3 text-muted"></i>
        </button>
      </li>

      <li v-if="!category.sub_categories.length" class="list-group-item text-muted">
        No sub-categories
      </li>
    </ul>

    <div class="input-group">
      <input
        class="form-control"
        placeholder="Add sub-category"
        v-model="newSub"
        :disabled="category.is_deleted"
      />
      <button
        class="btn btn-outline-plum"
        @click="addSubCategory"
        :disabled="category.is_deleted"
      >
        Add
      </button>
    </div>

    <small v-if="category.is_deleted" class="text-muted">
      Restore category to manage sub-categories.
    </small>
  </div>
</template>
