<script setup>
  import { ref, onMounted } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import api from "@/api";
  import ServiceForm from "@/components/admin/service/ServiceForm.vue";
  import { Notyf } from "notyf";

  const route = useRoute();
  const router = useRouter();
  const serviceId = route.params.serviceId;
  const notyf = new Notyf();

  const service = ref(null)

  const loadService = async () => {
    try {

      const res = await api.get(`/services/${serviceId}`)

      service.value = res.data
    } catch {
      notyf.error("Failed to load service")
      router.push("/admin/services")
    }
  }

  // const updateService = async (payload) => {
  //   try {
  //     await api.put(`/services/${serviceId}`, payload)
  //     notyf.success("Service updated")
  //     router.push(`/admin/services/${serviceId}`)
  //   } catch {
  //     notyf.error("Failed to update service")
  //   }
  // }

  const updateService = async (payload) => {
    try {
      const {
        name,
        description,
        duration,
        duration_unit,
        labor_price,
        materials,
        date_ended
      } = payload

      const cleanPayload = {
        name,
        description,
        duration,
        duration_unit,
        labor_price,
        materials,
        date_ended
      }

      await api.put(`/services/${serviceId}`, cleanPayload)

      notyf.success("Service updated")
      router.push(`/admin/services/${serviceId}`)
    } catch (err) {
      console.error(err)
      notyf.error("Failed to update service")
    }
  }


  onMounted(loadService)
</script>

<template>
  <ServiceForm
    v-if="service"
    :model-value="service"
    @submit="updateService"
  />
</template>
