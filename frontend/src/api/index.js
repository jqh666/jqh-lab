import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
})

// 请求拦截器 - 自动带 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jqh_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器 - 统一处理错误
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jqh_token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data || err)
  }
)

export default api

// API 接口
export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

export const blogApi = {
  list: (params) => api.get('/blogs', { params }),
  detail: (id) => api.get(`/blogs/${id}`),
  categories: () => api.get('/blogs/categories'),
  create: (data) => api.post('/blogs', data),
  update: (id, data) => api.put(`/blogs/${id}`, data),
  remove: (id) => api.delete(`/blogs/${id}`),
}

export const projectApi = {
  list: () => api.get('/projects'),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  remove: (id) => api.delete(`/projects/${id}`),
}

export const portfolioApi = {
  list: () => api.get('/portfolio'),
  detail: (id) => api.get(`/portfolio/${id}`),
  create: (data) => api.post('/portfolio', data),
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  remove: (id) => api.delete(`/portfolio/${id}`),
}

export const aiApi = {
  chat: (data) => api.post('/ai/chat', data, { responseType: 'text' }),
  listKnowledge: () => api.get('/ai/knowledge-list'),
  uploadKnowledge: (formData) => api.post('/ai/upload-knowledge', formData),
  deleteKnowledge: (id) => api.delete(`/ai/knowledge/${id}`),
}

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
}

export const uploadApi = {
  image: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteImage: (url) => api.delete('/upload/image', { params: { url } }),
}
