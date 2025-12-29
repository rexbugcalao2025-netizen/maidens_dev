<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import api from '@/api';
import notyf from '../../../utils/notyf';

const props = defineProps({
  category: Object
});

const emit = defineEmits(['close', 'saved']);

const name = ref('');

watch(
  () => props.category,
  (val) => {
    name.value = val ? val.name : '';
  },
  { immediate: true }
);

const save = async () => {

  if (!name.value.trim()) return alert('Name is required');

  if (props.category) {
    await api.put(`/service-categories/${props.category._id}`, {
      name: name.value
    });
    notyf.success('Update successful');
  } else {

    await api.post('/service-categories', {
      name: name.value
    });
    notyf.success('Category created');
  }

  emit('saved');
};

  onMounted(() => document.body.classList.add('modal-open'));
  onUnmounted(() => document.body.classList.remove('modal-open'));
</script>

<template>
  <!-- Backdrop -->
  <div class="modal-backdrop fade show"></div>

  <!-- Modal -->
  <div class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">
            {{ category ? 'Edit Category' : 'Add Category' }}
          </h5>
          <button class="btn-close" @click="$emit('close')" />
        </div>

        <div class="modal-body">
          <input
            class="form-control"
            placeholder="Category Name"
            v-model="name"
          />
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">
            Cancel
          </button>
          <button class="btn btn-primary" @click="save">
            Save
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
