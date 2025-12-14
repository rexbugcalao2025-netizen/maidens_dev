<!-- <script>
  import NavbarComponent from './components/NavbarComponent.vue';
  
  // import { useGlobalStore } from './stores/global.js';
  // import { onBeforeMount } from 'vue';

  // export default {
  //   components: {
  //     NavbarComponent
  //   }
  //   // ,
  //   // setup(){
  //   //   const { user, getUserDetails } = useGlobalStore();

  //   //   onBeforeMount(() => {
  //   //     getUserDetails(localStoreage.getItem('token'));
  //   //     // console.log(user);
  //   //   });
  //   // }
  // }

</script>

<template>
    
  <NavbarComponent />
  <p>Test page content</p>
  
</template>

<style>
/* Ensure full height for the app */
html, body, #app {
  height: 100%;
  margin: 0;
}
</style> -->

<script setup>
import NavbarComponent from './components/NavbarComponent.vue';
</script>

<template>
  <NavbarComponent />
  <div style="padding-top: 70px;">
    <router-view />
  </div>
</template>
