import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import HotelDetail from './pages/HotelDetail'
import SetupWizard from './pages/SetupWizard'
import Layout from './components/Layout'

const SECRET = import.meta.env.VITE_CP_SECRET || 'dc-control-2026'
export { SECRET }

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="hotel/:slug" element={<HotelDetail />} />
          <Route path="setup" element={<SetupWizard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}