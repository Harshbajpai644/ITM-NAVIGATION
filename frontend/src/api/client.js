import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itm_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('itm_refresh_token')
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/token/refresh/`, { refresh })
          localStorage.setItem('itm_access_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('itm_access_token')
          localStorage.removeItem('itm_refresh_token')
          localStorage.removeItem('itm_admin_user')
        }
      }
    }
    return Promise.reject(error)
  },
)

export default api

export const visitorApi = {
  create: (payload) => api.post('/visitor-pass/', payload),
  get: (id) => api.get(`/visitor-pass/${id}/`),
  list: (params) => api.get('/visitor-pass/', { params }),
  approve: (id, notes = '') => api.patch(`/visitor-pass/${id}/approve/`, { admin_notes: notes }),
  reject: (id, notes = '') => api.patch(`/visitor-pass/${id}/reject/`, { admin_notes: notes }),
  remove: (id) => api.delete(`/visitor-pass/${id}/`),
  stats: () => api.get('/visitor-pass/stats/'),
}

export const buildingApi = {
  list: (params) => api.get('/buildings/', { params }),
  get: (id) => api.get(`/buildings/${id}/`),
  create: (payload) => api.post('/buildings/', payload),
  update: (id, payload) => api.put(`/buildings/${id}/`, payload),
  patch: (id, payload) => api.patch(`/buildings/${id}/`, payload),
  remove: (id) => api.delete(`/buildings/${id}/`),
  categories: () => api.get('/buildings/categories/'),
  active: () => api.get('/buildings/active/'),
}

export const adminApi = {
  login: (username, password) => api.post('/admin/login/', { username, password }),
  me: () => api.get('/admin/me/'),
  dashboard: () => api.get('/admin/dashboard/'),
  campusInfo: () => api.get('/admin/campus-info/'),
  health: () => api.get('/admin/health/'),
}