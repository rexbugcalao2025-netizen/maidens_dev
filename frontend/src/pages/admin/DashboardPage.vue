<!-- src/pages/admin/DashboardPage.vue -->
<script setup>
import Shortcut from '@/components/admin/dashboard/Shortcut.vue'
import Panel from '@/components/admin/dashboard/Panel.vue'
import Table from '@/components/admin/dashboard/Table.vue'
</script>

<template>
  <div class="dashboard-bg">
    <div class="dashboard-overlay p-4">
      <div class="container-fluid">
        <div class="row">
          <!-- LEFT COLUMN -->
          <div class="col-lg-5 mb-4 mb-lg-0">
            <h2 class="mb-4">Admin Dashboard</h2>

            <div class="d-flex flex-wrap gap-3">
              <!-- SERVICES -->
              <Shortcut
                icon="bi-scissors"
                label="Services"
                :to="{ name: 'AdminNewClientService' }"
              />

              <!-- PLACEHOLDERS (can be wired later) -->
              <Shortcut icon="bi-box-seam" label="Inventory" />
              <Shortcut icon="bi-people" label="Clients" />
              <Shortcut icon="bi-person-badge" label="Employees" />
              <Shortcut icon="bi-folder2-open" label="Library" />
            </div>
          </div>

          <!-- RIGHT COLUMN -->
          <div class="col-lg-7 d-flex flex-column gap-3">
            <Panel
              title="Today’s Appointment"
              subtitle="Thursday – February 12, 2026"
              :defaultOpen="true"
            >
              <Table :headers="['Time', 'Client', 'Service', 'Staff', '…']" />
            </Panel>

            <Panel
              title="Open Transactions"
              subtitle="Services with incomplete status"
              :defaultOpen="false"
            >
              <Table :headers="['Date', 'Client', 'Service', '…']" />
            </Panel>

            <Panel
              title="Client Booking"
              subtitle="Client advance booking"
              :defaultOpen="false"
            >
              <Table :headers="['Date', 'Client', 'Service', 'Staff', '…']" />
            </Panel>

            <Panel
              title="Reminders"
              subtitle="To Do’s"
              :defaultOpen="false"
            >
              <Table :headers="['Date', 'Note', 'Level', '…']" />
            </Panel>

            <Panel
              title="Client Follow Ups"
              subtitle="Call a client and make them feel cared — the Maidens way"
              :defaultOpen="false"
            >
              <Table :headers="['Client', 'Phone', 'Service', 'Contacted', '…']" />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-bg {
  min-height: 100vh;
  background-image: url('@/assets/backgrounds/fourmaidens-bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.dashboard-overlay {
  min-height: 100vh;
  background: rgba(249, 250, 251, 0.92);
}
</style>
