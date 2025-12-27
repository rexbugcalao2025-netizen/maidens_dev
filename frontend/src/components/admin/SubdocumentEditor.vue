<script setup>
import { ref } from 'vue';

defineProps({
  title: {
    type: String,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  emptyText: {
    type: String,
    default: 'No records found'
  },
  badgeResolver: {
    type: Function,
    default: null
  }
});

const emit = defineEmits(['add', 'edit', 'remove']);

const confirmRemove = (item) => {
  if (!confirm('Are you sure you want to remove this item?')) {
    return;
  }

  emit('remove', item._id);
};

// Job Position
const showJobPositionModal = ref(false);
const editingJobPosition = ref(null);

const jobPositionForm = ref({
  title: '',
  entity: '',
  date_started: '',
  date_ended: null
});

// Credential
const showCredentialModal = ref(false);
const editingCredential = ref(null);

const credentialForm = ref({
  credential_type: '',
  value: '',
  acquire_on_date: '',
  expire_on_date: null
});


/* ======================
   JOB POSITION MODAL
   ====================== */

const openAddJobPosition = () => {
  

  editingJobPosition.value = null;
  jobPositionForm.value = {
    title: '',
    entity: '',
    date_started: '',
    date_ended: null
  };
  showJobPositionModal.value = true;
};

const openEditJobPosition = (position) => {
  editingJobPosition.value = position;
  jobPositionForm.value = {
    title: position.title,
    entity: position.entity,
    date_started: position.date_started?.substring(0, 10),
    date_ended: position.date_ended
      ? position.date_ended.substring(0, 10)
      : null
  };
  showJobPositionModal.value = true;
};

const closeJobPositionModal = () => {
  showJobPositionModal.value = false;
};

/* ======================
   CREDENTIAL MODAL
   ====================== */

const openAddCredential = () => {
  editingCredential.value = null;
  credentialForm.value = {
    credential_type: '',
    value: '',
    acquire_on_date: '',
    expire_on_date: null
  };
  showCredentialModal.value = true;
};

const openEditCredential = (cred) => {
  editingCredential.value = cred;
  credentialForm.value = {
    credential_type: cred.credential_type,
    value: cred.value,
    acquire_on_date: cred.acquire_on_date?.substring(0, 10),
    expire_on_date: cred.expire_on_date
      ? cred.expire_on_date.substring(0, 10)
      : null
  };
  showCredentialModal.value = true;
};

const closeCredentialModal = () => {
  showCredentialModal.value = false;
};

const saveJobPosition = async () => {
  try {
    if (editingJobPosition.value) {
      await api.put(
        `/employees/${employee.value._id}/job-positions/${editingJobPosition.value._id}`,
        {
          ...jobPositionForm.value,
          entity: jobPositionForm.value.entity.toUpperCase(),
          is_active: isActiveByEndDate(jobPositionForm.value.date_ended)
        }
      );

      notyf.success('Job position updated');
    } else {
      await api.post(
        `/employees/${employee.value._id}/job-positions`,
        {
          ...jobPositionForm.value,
          entity: jobPositionForm.value.entity.toUpperCase(),
          is_active: isActiveByEndDate(jobPositionForm.value.date_ended)
        }
      );

      notyf.success('Job position added');
    }

    closeJobPositionModal();
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to save job position');
  }
};

const saveCredential = async () => {
  try {
    if (editingCredential.value) {
      await api.put(
        `/employees/${employee.value._id}/credentials/${editingCredential.value._id}`,
        {
          ...credentialForm.value,
          is_active: isActiveByEndDate(credentialForm.value.expire_on_date)
        }
      );

      notyf.success('Credential updated');
    } else {
      await api.post(
        `/employees/${employee.value._id}/credentials`,
        {
          ...credentialForm.value,
          is_active: isActiveByEndDate(credentialForm.value.expire_on_date)
        }
      );

      notyf.success('Credential added');
    }

    closeCredentialModal();
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to save credential');
  }
};

</script>

<template>
  <div class="mb-4">

    <!-- HEADER -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="text-muted mb-0">
        {{ title }}
      </h6>

      <button
        class="btn btn-sm btn-outline-plum"
        @click="$emit('add')"
      >
        <i class="bi bi-plus-lg"></i>
        Add
      </button>
    </div>

    <!-- EMPTY -->
    <div v-if="!items.length" class="text-muted small">
      {{ emptyText }}
    </div>

    <!-- LIST -->
    <ul v-else class="list-group">
      <li
        v-for="item in items"
        :key="item._id"
        class="list-group-item d-flex justify-content-between align-items-start"
      >
        <!-- SLOT: ITEM CONTENT -->
        <div class="me-3 w-100">
          <slot name="item" :item="item" />
        </div>

        <!-- ACTIONS -->
        <div class="text-end ms-2">
          <div v-if="badgeResolver" class="mb-1">
            <span
              class="badge"
              :class="badgeResolver(item).class"
            >
              {{ badgeResolver(item).label }}
            </span>
          </div>

          <div class="btn-group btn-group-sm">
            <button
              class="btn btn-outline-secondary"
              @click="$emit('edit', item)"
            >
              <i class="bi bi-pencil"></i>
            </button>

            <button
              class="btn btn-outline-danger"
              @click="confirmRemove(item)"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </li>
    </ul>

  </div>
</template>
