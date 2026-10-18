const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('agri_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  // Products
  async getProducts(category) {
    const url = category && category !== 'All' 
      ? `${API_BASE_URL}/products?category=${encodeURIComponent(category)}` 
      : `${API_BASE_URL}/products`;
    const res = await fetch(url);
    return res.json();
  },

  async placeOrder(orderData) {
    const res = await fetch(`${API_BASE_URL}/products/order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(orderData)
    });
    return res.json();
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Users
  async getUsers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.role && filters.role !== 'All') params.append('role', filters.role);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  async updateUser(id, updates) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },

  // Drivers
  async getDrivers(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE_URL}/drivers?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async createDriver(driverData) {
    const res = await fetch(`${API_BASE_URL}/drivers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(driverData)
    });
    return res.json();
  },

  async updateDriver(id, updates) {
    const res = await fetch(`${API_BASE_URL}/drivers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates)
    });
    return res.json();
  },

  // Shipments
  async getShipments(filters = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.isDelayed !== undefined && filters.isDelayed !== '') params.append('isDelayed', filters.isDelayed);
    if (filters.search) params.append('search', filters.search);
    const res = await fetch(`${API_BASE_URL}/shipments?${params.toString()}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async trackShipment(trackingNumber) {
    const res = await fetch(`${API_BASE_URL}/shipments/track/${encodeURIComponent(trackingNumber)}`);
    return res.json();
  },

  async createShipment(shipmentData) {
    const res = await fetch(`${API_BASE_URL}/shipments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(shipmentData)
    });
    return res.json();
  },

  async assignDriver(shipmentId, driverId) {
    const res = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/assign-driver`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ driverId })
    });
    return res.json();
  },

  async autoDispatch(shipmentId) {
    const res = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/auto-dispatch`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },

  async updateShipmentStatus(shipmentId, statusData) {
    const res = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/update-status`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(statusData)
    });
    return res.json();
  },

  async confirmProofOfDelivery(shipmentId, podData) {
    const res = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/proof-of-delivery`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(podData)
    });
    return res.json();
  },

  // Reports
  async getReportsSummary() {
    const res = await fetch(`${API_BASE_URL}/reports/summary`, {
      headers: getHeaders()
    });
    return res.json();
  },

  getExportCsvUrl() {
    return `${API_BASE_URL}/reports/export-csv`;
  },

  // Global Search
  async globalSearch(query) {
    const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      headers: getHeaders()
    });
    return res.json();
  }
};
