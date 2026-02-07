// src/modules/inventory/services/inventory.api.js


import api from '@/api'; // ✅ points to src/api/index.js

export async function fetchInventory() {
  const { data } = await api.get('/api/inventory/products');
  return data;
}

export async function adjustStock(payload) {
  return api.post('/api/inventory/adjust', payload);
}

export async function consumeStock(payload) {
  return api.post('/api/inventory/consume', payload);
}
