// src/api/axios.js
// Instance Axios avec base URL et intercepteur JWT

import axios from 'axios'

// URL vide = requêtes relatives → passent par le proxy Vite → pas de CORS
// Le proxy dans vite.config.js redirige /api/* vers http://localhost:3000
const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dq_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirige vers login si 401 SEULEMENT si l'utilisateur avait un token
// (évite de rediriger les citoyens qui accèdent à des routes publiques)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const hadToken = !!localStorage.getItem('dq_token')
    if (error.response?.status === 401 && hadToken) {
      localStorage.removeItem('dq_token')
      localStorage.removeItem('dq_user')
      window.location.href = '/agent/login'
    }
    return Promise.reject(error)
  }
)

export default api
