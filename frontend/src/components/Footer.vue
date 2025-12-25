<template>
   <footer class="custom-footer mt-auto py-2">
    <div class="container text-center footer-bottom">
      © {{ new Date().getFullYear() }} Four Maidens Beauty Haven. All rights reserved.
    </div>
  </footer>
</template>



<style scoped>
.custom-footer {
  background-color: #f7c6d9;
  color: #3a2a33;
  font-size: 0.85rem;
}

.footer-content {
  padding: 1rem 0; /* 🔥 reduced padding */
}

.footer-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.4rem;
}

.footer-text {
  margin-bottom: 0.25rem;
  opacity: 0.85;
}

.footer-links li {
  margin-bottom: 0.2rem;
}

.footer-links a {
  color: #3a2a33;
  text-decoration: none;
  font-size: 0.85rem;
}

.footer-links a:hover {
  color: #b84c7a;
  text-decoration: underline;
}

.footer-divider {
  border-color: rgba(58, 42, 51, 0.25);
}

.footer-bottom {
  font-size: 0.8rem;
  opacity: 0.8;
}
</style>
