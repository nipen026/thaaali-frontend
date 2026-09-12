import axios from 'axios';

// No hardcoded default here — the backend's port is whatever VITE_API_URL says
// it is (see .env.example). Fails loudly rather than silently guessing one.
// Re-exported so other consumers (e.g. the Socket.io client in Layout.jsx) share
// this one source instead of hardcoding the same host/port again.
export const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error('Missing VITE_API_URL — set it in frontend/.env (see .env.example).');
}

const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('thaali_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const tablesAPI = {
  getAll: () => api.get('/tables'),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.put(`/tables/${id}`, data),
  remove: (id) => api.delete(`/tables/${id}`),
  updateStatus: (id, data) => api.put(`/tables/${id}/status`, data),
  seat: (id, data) => api.post(`/tables/${id}/seat`, data),
};

export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  getActive: () => api.get('/orders/active'),
  create: (data) => api.post('/orders', data),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  addItems: (id, items) => api.post(`/orders/${id}/add-items`, { items }),
  updateItems: (id, items) => api.put(`/orders/${id}/items`, { items }),
};

export const menuAPI = {
  getAll: (params) => api.get('/menu', { params }),
  update: (id, data) => api.put(`/menu/${id}`, data),
  create: (data) => api.post('/menu', data),
  createCategory: (data) => api.post('/menu/categories', data),
};

export const billingAPI = {
  generate: (data) => api.post('/billing/generate', data),
  pay: (id, method) => api.put(`/billing/${id}/pay`, { payment_method: method }),
  getAll: () => api.get('/billing'),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  getAlerts: () => api.get('/inventory/alerts'),
  reorder: (ids) => api.post('/inventory/reorder', { ids }),
};

export const staffAPI = {
  getAll: () => api.get('/staff'),
  create: (data) => api.post('/staff', data),
  update: (id, data) => api.put(`/staff/${id}`, data),
  updateStatus: (id, status) => api.put(`/staff/${id}/status`, { status }),
};

export const analyticsAPI = {
  overview: () => api.get('/analytics/overview'),
  weekly: () => api.get('/analytics/weekly'),
  hourly: () => api.get('/analytics/hourly'),
  channels: () => api.get('/analytics/channels'),
  topItems: () => api.get('/analytics/top-items'),
  ledger: (from,to) => api.get('/analytics/ledger', { params: { from, to } }),
};

export const hotelAPI = {
  getRooms: () => api.get('/hotel/rooms'),
  updateRoom: (id, data) => api.put(`/hotel/rooms/${id}/status`, data),
  getReservations: () => api.get('/hotel/reservations'),
  checkIn: (data) => api.post('/hotel/checkin', data),
  checkOut: (id) => api.post(`/hotel/checkout/${id}`),
  getStats: () => api.get('/hotel/stats'),
};

export const tenantAPI = {
  get: () => api.get('/tenant'),
  update: (data) => api.put('/tenant', data),
};

// AI routes wrap their payload as { data, meta } (see backend/routes/ai.js) so the frontend
// can render an "AI-generated" badge consistently across features later — unwrapped here so
// every other aiAPI.* call site can just read `r.data` like every other API in this file.
export const aiAPI = {
  scanMenu: (imageBase64) => api.post('/ai/menu/scan', { image: imageBase64 }).then((r) => ({ ...r, data: r.data.data, meta: r.data.meta })),
};

export default api;
