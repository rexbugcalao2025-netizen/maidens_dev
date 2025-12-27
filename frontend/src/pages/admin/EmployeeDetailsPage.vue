<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../../api';
import notyf from '../../utils/notyf';
import SubdocumentEditor from '../../components/admin/SubdocumentEditor.vue';

/* ======================
   ROUTER
   ====================== */
const route = useRoute();
const router = useRouter();

/* ======================
   STATE
   ====================== */
const employee = ref(null);
const user = ref(null);
const loading = ref(true);

/* ======================
   MODAL STATE
   ====================== */
const showJobPositionModal = ref(false);
const showCredentialModal = ref(false);

const editingJobPosition = ref(null);
const editingCredential = ref(null);

/* ======================
   FORMS
   ====================== */
const jobPositionForm = ref({
  title: '',
  entity: '',
  date_started: '',
  date_ended: null
});

const credentialForm = ref({
  credential_type: '',
  value: '',
  acquire_on_date: '',
  expire_on_date: null
});

/* ======================
   HELPERS
   ====================== */
const isActiveByEndDate = (endDate) => {
  if (!endDate) return true;
  return new Date(endDate) >= new Date();
};

const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString() : '—';
};

/* ======================
   FETCH EMPLOYEE
   ====================== */
const loadEmployee = async () => {
  loading.value = true;

  try {
    const empRes = await api.get(`/employees/${route.params.id}`);
    employee.value = empRes.data;

    const userId =
      employee.value.user_id._id || employee.value.user_id;

    const userRes = await api.get(`/users/${userId}`);
    user.value = userRes.data;

  } catch (err) {
    notyf.error(
      err.response?.data?.message ||
      'Failed to load employee'
    );
    router.push('/admin/employees');
  } finally {
    loading.value = false;
  }
};

onMounted(loadEmployee);

/* ======================
   COMPUTED
   ====================== */
const displayName = computed(() => {
  if (!user.value) return '';
  if (user.value.full_name?.trim()) return user.value.full_name;
  if (user.value.first_name || user.value.last_name) {
    return `${user.value.first_name ?? ''} ${user.value.last_name ?? ''}`.trim();
  }
  return user.value.email;
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

const saveJobPosition = async () => {
  try {

    const payload = {
      ...jobPositionForm.value,
      entity: jobPositionForm.value.entity.toUpperCase(),
      is_active: isActiveByEndDate(jobPositionForm.value.date_ended)
    };  

    if(payload.title === '' || payload.entity === '' || payload.date_started === ''){
      notyf.error('Required fields(*) are missing.');
      return;
    }

    if (editingJobPosition.value) {
      await api.put(
        `/employees/${employee.value._id}/job-positions/${editingJobPosition.value._id}`,
        payload
      );
      notyf.success('Job position updated');
    } else {

      // DEBUG
      console.log(payload);


      await api.post(
        `/employees/${employee.value._id}/job-positions`,
        payload
      );
      notyf.success('Job position added');
    }

    closeJobPositionModal();
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to save job position');
  }
};

const removeJobPosition = async (jpId) => {
  if (!confirm('Remove this job position?')) return;

  try {

    // DELETE AFTER DEBUG
    console.log(`employee.value._id: ${employee.value._id}`);
    console.log(`jpId: ${jpId}`);

    await api.delete(
      `/employees/${employee.value._id}/job-positions/${jpId}`
    );
    notyf.success('Job position removed');
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to remove job position');
  }
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

const saveCredential = async () => {
  try {
    const payload = {
      ...credentialForm.value,
      is_active: isActiveByEndDate(credentialForm.value.expire_on_date)
    };

    if(payload.credential_type === '' || payload.value === '' || payload.acquire_on_date === ''){
      notyf.error('Required fields(*) are missing.');
      return;
    }

    if (editingCredential.value) {
      await api.put(
        `/employees/${employee.value._id}/credentials/${editingCredential.value._id}`,
        payload
      );
      notyf.success('Credential updated');
    } else {
      await api.post(
        `/employees/${employee.value._id}/credentials`,
        payload
      );
      notyf.success('Credential added');
    }

    closeCredentialModal();
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to save credential');
  }
};

const removeCredential = async (credId) => {
  if (!confirm('Remove this credential?')) return;

  try {
    await api.delete(
      `/employees/${employee.value._id}/credentials/${credId}`
    );
    notyf.success('Credential removed');
    await loadEmployee();
  } catch (err) {
    notyf.error('Failed to remove credential');
  }
};
</script>


<template>
  <div class="container pt-4" style="max-width: 900px;">

    <!-- LOADING -->
    <div v-if="loading" class="text-muted">
      Loading employee details...
    </div>

    <!-- CONTENT -->
    <div v-else-if="employee && user" class="card">
      <div class="card-body">

        <!-- HEADER -->
        <h4 class="mb-4">
          <i class="bi bi-person-badge me-2"></i>
          Employee Details
        </h4>

        <!-- PROFILE -->
        <h6 class="text-muted mb-2">Profile</h6>
        <ul class="list-group mb-4">
          <li class="list-group-item">
            <strong>Email:</strong>
            <span class="ms-1">{{ user.email }}</span>
          </li>

          <li class="list-group-item">
            <strong>Name:</strong>
            <span class="ms-1">{{ displayName }}</span>
          </li>

          <li class="list-group-item">
            <strong>Date Hired:</strong>
            <span class="ms-1">{{ formatDate(employee.date_hired) }}</span>
          </li>

          <li class="list-group-item">
            <strong>Date Retired:</strong>
            <span class="ms-1">
              {{ employee.date_retired ? formatDate(employee.date_retired) : '—' }}
            </span>
          </li>

          <li class="list-group-item">
            <strong>TIN:</strong>
            <span class="ms-1">
              {{ employee.tax_identification_number || '—' }}
            </span>
          </li>
        </ul>

        <!-- JOB POSITIONS -->        
        <h6 class="text-muted mb-2">Job Positions</h6>
        <SubdocumentEditor
          
          :items="employee.job_position"
          empty-text="No job positions recorded"
          :badge-resolver="positionStatusBadge"
          @add="openAddJobPosition"
          @edit="openEditJobPosition"
          @remove="removeJobPosition"
        >
          <template #item="{ item }">
            <div class="fw-semibold">
              {{ item.title }}
            </div>
            <div class="small text-muted">
              {{ item.entity }} ·
              {{ formatDate(item.date_started) }}
              →
              {{ formatDate(item.date_ended) }}
            </div>
          </template>
        </SubdocumentEditor>

        <!-- CREDENTIALS -->       
        <h6 class="text-muted mb-2 mt-4">Credentials</h6>
        <SubdocumentEditor          
          :items="employee.credentials"
          empty-text="No credentials recorded"
          :badge-resolver="credentialStatusBadge"
          @add="openAddCredential"
          @edit="openEditCredential"
          @remove="removeCredential"
        >
          <template #item="{ item }">
            <div class="fw-semibold">
              {{ item.credential_type.replace('_', ' ') }}
            </div>
            <div class="small text-muted">
              {{ item.value }} ·
              {{ formatDate(item.acquire_on_date) }}
              →
              {{ formatDate(item.expire_on_date) }}
            </div>
          </template>
        </SubdocumentEditor>

        <!-- ACTIVITY (MATCH CLIENT PAGE) -->
        <h6 class="text-muted mb-2 mt-4">Activity</h6>
        <ul class="list-group">
          <li class="list-group-item">
            <strong>Last Login:</strong>
            <span class="text-muted ms-1">Not available yet</span>
          </li>
          <li class="list-group-item">
            <strong>Employment Status:</strong>
            <span
              class="badge ms-2"
              :class="employee.date_retired ? 'badge-muted' : 'badge-rose'"
            >
              {{ employee.date_retired ? 'Retired' : 'Active' }}
            </span>
          </li>
        </ul>

      </div>
    </div>

    <!-- FALLBACK -->
    <div v-else class="text-muted">
      Employee record not found.
    </div>

  </div>

  <div v-if="showJobPositionModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editingJobPosition ? 'Edit Job Position' : 'Add Job Position' }}
          </h5>
          <button class="btn-close" @click="closeJobPositionModal"></button>
        </div>

        <div class="modal-body">

          <div class="mb-3">
            <label class="form-label">
              Job Title <span class="text-danger">*</span>
            </label>
            <input
              v-model="jobPositionForm.title"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">
              Company <span class="text-danger">*</span>
            </label>
            <input
              v-model="jobPositionForm.entity"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">
              Date Started <span class="text-danger">*</span>
            </label>
            <input
              v-model="jobPositionForm.date_started"
              type="date"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Date Ended</label>
            <input
              v-model="jobPositionForm.date_ended"
              type="date"
              class="form-control"
            />
          </div>

        </div>


        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeJobPositionModal">Cancel</button>
          <button class="btn btn-primary" @click="saveJobPosition">Save</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="showCredentialModal" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ editingCredential ? 'Edit Credential' : 'Add Credential' }}
          </h5>
          <button class="btn-close" @click="closeCredentialModal"></button>
        </div>

        <div class="modal-body">

          <div class="mb-3">
            <label class="form-label">
              Credential Type <span class="text-danger">*</span>
            </label>
            <select
              v-model="credentialForm.credential_type"
              class="form-select"
              required
            >
              <option value="">Select type</option>
              <option value="drivers_license">Driver’s License</option>
              <option value="prc_license">PRC License</option>
              <option value="tesda_certificate">TESDA Certificate</option>
              <option value="training_certificate">Training Certificate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">
              Value <span class="text-danger">*</span>
            </label>
            <input
              v-model="credentialForm.value"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">
              Date Acquired <span class="text-danger">*</span>
            </label>
            <input
              v-model="credentialForm.acquire_on_date"
              type="date"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Expiry Date</label>
            <input
              v-model="credentialForm.expire_on_date"
              type="date"
              class="form-control"
            />
          </div>

        </div>


        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeCredentialModal">Cancel</button>
          <button class="btn btn-primary" @click="saveCredential">Save</button>
        </div>
      </div>
    </div>
  </div>


</template>
