<script setup>
  import Navbar from './components/Navbar.vue';
  import Footer from './components/Footer.vue';
  import InactivityModal from './components/InactivityModal.vue';

  import { onMounted, onBeforeUnmount } from 'vue';
  import { useAuthStore } from './stores/auth';
  
  const auth = useAuthStore();

  const resetTimer = () => {
    auth.resetInactivityTimer();
  }

  onMounted(() => {
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => 
      window.addEventListener(evt, resetTimer)
    );
  });

  onBeforeUnmount(() => {
    ['mousemove', 'keydown', 'click', 'scroll'].forEach(evt => 
      window.removeEventListener(evt, resetTimer)
    );
  });


</script>

<template>
  <div class="d-flex flex-column min-vh-100">
    <Navbar />

    <main class="flex-grow-1">
      <router-view />
    </main>

    <Footer />
  </div>

  <!-- Global inactivity modal -->
  <InactivityModal />  

</template>
