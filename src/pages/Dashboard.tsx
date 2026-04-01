import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cp } from '../hooks/useApi'

interface Hotel {
  id: string
  slug: string
  name: string
  location: string
  plan: string
  active: boolean
  created_at: string
}

const PLAN_COLORS: Record<string, string> = {
  starter: '#6c757d',
  professional: '#0d6efd',
  enterprise: '#c9a227',
}

export default function Dashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadHotels = async () => {
    try {
      const res = await cp.getHotels()
      setHotels(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHotels() }, [])

  const toggle = async (slug: string, active: boolean) => {
    await cp.toggleHotel(slug, !active)
    loadHotels()
  }

  const upgrade = async (slug: string, currentPlan: string) => {
    const plans = ['starter', 'professional', 'enterprise']
    const next = plans[(plans.indexOf(currentPlan) + 1) % plans.length]
    if (confirm(`Αλλαγή plan σε "${next}";`)) {
      await cp.upgradePlan(slug, next)
      loadHotels()
    }
  }

  if (loading) return <div style={{ color: '#666' }}>Φόρτωση...</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Hotels ({hotels.length})</h1>
        <button onClick={() => navigate('/setup')}
          style={{ background: '#c9a227', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          + New Hotel
        </button>
      </div>

      <div style={{ display: 'grid', gap: '16px' }}>
        {hotels.map(hotel => (
          <div key={hotel.id} style={{
            background: '#fff', borderRadius: '12px', padding: '20px 24px',
            border: '1px solid #e9ecef', display: 'flex', alignItems: 'center', gap: '16px',
            opacity: hotel.active ? 1 : 0.6
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontWeight: '600', fontSize: '16px' }}>{hotel.name}</span>
                <span style={{
                  background: PLAN_COLORS[hotel.plan] || '#666',
                  color: '#fff', fontSize: '11px', padding: '2px 8px',
                  borderRadius: '12px', fontWeight: '600', textTransform: 'uppercase'
                }}>{hotel.plan}</span>
                <span style={{
                  background: hotel.active ? '#d4edda' : '#f8d7da',
                  color: hotel.active ? '#155724' : '#721c24',
                  fontSize: '11px', padding: '2px 8px', borderRadius: '12px'
                }}>{hotel.active ? 'Active' : 'Suspended'}</span>
              </div>
              <div style={{ color: '#6c757d', fontSize: '13px' }}>
                {hotel.location} · slug: <code>{hotel.slug}</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => navigate(`/hotel/${hotel.slug}`)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                Διαχείριση
              </button>
              <button onClick={() => upgrade(hotel.slug, hotel.plan)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #0d6efd', color: '#0d6efd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
                Upgrade Plan
              </button>
              <button onClick={() => toggle(hotel.slug, hotel.active)}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  background: hotel.active ? '#dc3545' : '#28a745', color: '#fff'
                }}>
                {hotel.active ? 'Suspend' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}