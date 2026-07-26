// Centralized API service layer
const BASE_URL = '/api/v1';

const getToken = () => localStorage.getItem('token');

const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API Error');
  return data;
};

export const authAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),
};

export const userAPI = {
  getMe: () => fetch(`${BASE_URL}/me`, { headers: headers() }).then(handleResponse),
  updatePassword: (oldPassword, newPassword) => fetch(`${BASE_URL}/me/password`, { method: 'PUT', headers: headers(), body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }) }).then(handleResponse),
  getAll: (page = 1, limit = 10, search = '') => fetch(`${BASE_URL}/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`, { headers: headers() }).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/users`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  update: (id, data) => fetch(`${BASE_URL}/users/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/users/${id}`, { method: 'DELETE', headers: headers() }).then(handleResponse),
};

export const cobitAPI = {
  getDomains: () => fetch(`${BASE_URL}/cobit/domains`, { headers: headers() }).then(handleResponse),
  getDomainById: (id) => fetch(`${BASE_URL}/cobit/domains/${id}`, { headers: headers() }).then(handleResponse),
  getObjectives: () => fetch(`${BASE_URL}/cobit/objectives`, { headers: headers() }).then(handleResponse),
  createDomain: (data) => fetch(`${BASE_URL}/cobit/domains`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  createObjective: (data) => fetch(`${BASE_URL}/cobit/objectives`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  createPractice: (data) => fetch(`${BASE_URL}/cobit/practices`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  createActivity: (data) => fetch(`${BASE_URL}/cobit/activities`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
};

export const assessmentAPI = {
  getAll: () => fetch(`${BASE_URL}/assessments`, { headers: headers() }).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/assessments/${id}`, { headers: headers() }).then(handleResponse),
  create: (data) => fetch(`${BASE_URL}/assessments`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
  updateStatus: (id, status) => fetch(`${BASE_URL}/assessments/${id}/status`, { method: 'PUT', headers: headers(), body: JSON.stringify({ status }) }).then(handleResponse),
  getAnswers: (id) => fetch(`${BASE_URL}/assessments/${id}/answers`, { headers: headers() }).then(handleResponse),
  submitAnswer: (data) => fetch(`${BASE_URL}/assessments/answers`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handleResponse),
};

export const reportAPI = {
  generate: (id) => fetch(`${BASE_URL}/reports/${id}`, { headers: headers() }).then(handleResponse),
};
