import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'https://ai-concierge-xmeb.onrender.com'
const SECRET = import.meta.env.VITE_CP_SECRET || 'dc-control-2026'

export const api = axios.create({ baseURL: API })

export const cp = {
  getHotels: () => api.get(`/cp/hotels?secret=${SECRET}`),
  createHotel: (slug: string, name: string, location: string, plan: string) =>
    api.post(`/cp/hotels?secret=${SECRET}&slug=${slug}&name=${encodeURIComponent(name)}&location=${encodeURIComponent(location)}&plan=${plan}`),
  toggleHotel: (slug: string, active: boolean) =>
    api.patch(`/cp/hotels/${slug}/toggle?secret=${SECRET}&active=${active}`),
  upgradePlan: (slug: string, plan: string) =>
    api.patch(`/cp/hotels/${slug}/plan?secret=${SECRET}&plan=${plan}`),
  getUsage: () => api.get(`/cp/usage?secret=${SECRET}`),
  healthCheck: (slug: string) => api.get(`/health/${slug}`),
}