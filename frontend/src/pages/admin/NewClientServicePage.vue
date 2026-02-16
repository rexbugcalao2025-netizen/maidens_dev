<!-- src/pages/admin/NewClientServicePage.vue -->

<script setup>
import { ref } from 'vue';

const searchKey = ref('');
</script>

<template>
  <div class="admin-bg">
    <div class="admin-overlay">
      <div class="container-fluid p-4">

        <!-- PAGE TITLE -->
        <h2 class="mb-4">New Client Service</h2>

        <!-- SEARCH BAR -->
        <div class="d-flex align-items-center gap-2 mb-4 flex-wrap">
          <label class="fw-medium">Search Key:</label>
          <input
            v-model="searchKey"
            type="text"
            class="form-control"
            style="max-width: 320px"
          />

          <button class="btn btn-outline-primary">
            <i class="bi bi-person-badge me-1"></i>
            Search by Client ID
          </button>

          <button class="btn btn-outline-primary">
            <i class="bi bi-search me-1"></i>
            Search by Name
          </button>

          <button class="btn btn-outline-primary">
            <i class="bi bi-envelope me-1"></i>
            Search by Email
          </button>
        </div>

        <!-- CLIENT DETAILS -->
        <div class="card shadow-sm rounded-4 mb-4">
          <div class="card-body">
            <div class="row">
              <!-- LEFT -->
              <div class="col-md-6">
                <p><strong>Client ID:</strong> ID_NUMBER</p>
                <p><strong>Name:</strong> Client Full Name</p>
                <p><strong>Address:</strong> Customer Address</p>
                <p><strong>Phone No:</strong><br>
                  Phone 1<br>
                  Phone 2<br>
                  Phone 3
                </p>
                <p><strong>Email:</strong> Email Address</p>
              </div>

              <!-- RIGHT -->
              <div class="col-md-6 text-md-end">
                <h5 class="fw-semibold mb-3">Client Details</h5>
                <p><strong>Date Registered:</strong> Date Registered</p>
                <p><strong>Date Last Visited:</strong> Date Last Visited</p>
              </div>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link active">Services</button>
          </li>
          <li class="nav-item">
            <button class="nav-link">Materials</button>
          </li>
          <li class="nav-item">
            <button class="nav-link">Specialists</button>
          </li>
        </ul>

        <!-- SERVICES SECTION -->
        <div class="card shadow-sm rounded-4">
          <div class="card-body">

            <div class="d-flex justify-content-between align-items-center mb-3">
              <p class="mb-0">
                <strong>Client Service ID:</strong> ID_NUMBER
              </p>

              <button class="btn btn-primary">
                <i class="bi bi-plus-circle me-2"></i>
                Add New Service
              </button>
            </div>

            <div class="table-responsive">
              <table class="table table-bordered align-middle text-center">
                <thead class="table-light">
                  <tr>
                    <th>Name of Service</th>
                    <th>Service Category</th>
                    <th>Materials</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="text-muted">
                      No services added yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="text-end fw-semibold mt-3">
              TOTAL PRICE: ₱ 1,000.00
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

</template>

<style scoped>
.admin-bg {
  min-height: 100vh;
  width: 100vw;
  background-image: url('@/assets/backgrounds/fourmaidens-bg.png');
  background-size: cover;
  background-position: center;
}

.admin-overlay {
  min-height: 100vh;
  background: rgba(249, 250, 251, 0.92);
}
</style>