import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cp } from '../hooks/useApi'

interface UsageLog {
  date: string
  sessions: number
  api_calls: number
  did_credits_used: number
  tokens_used: number
}

interface Hotel {
  id: string
  slug: string
  name: string
  location: string
  plan: string
  active: boolean
}

const PLAN_COLORS: Record<string, string> = {
  starter: '#6c757d',
  professional: '#0d6efd',
  enterprise: '#c9a227',
}

export default function HotelDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [usage, setUsage] = useState<UsageLog[]>([])
  const [health, setHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!slug) return
    Promise.all([
      cp.getHotels(),
      cp.getUsage(),
      cp.healthCheck(slug).catch(() => ({ data: { error: true } }))
    ]).then(([hotels, usageLogs, healthRes]) => {
      const h = hotels.data.find((h: Hotel) => h.slug === slug)
      setHotel(h || null)
      setUsage(usageLogs.data.filter((u: any) => u.hotels?.slug === slug))
      setHealth(healthRes.data)
    }).finally(() => setLoading(false))
  }, [slug])

  const toggle = async () => {
    if (!hotel) return
    if (!confirm(`${hotel.active ? 'Suspend' : 'Activate'} το ${hotel.name};`)) return
    await cp.toggleHotel(hotel.slug, !hotel.active)
    setHotel(h => h ? { ...h, active: !h.active } : h)
  }

  const upgrade = async () => {
    if (!hotel) return
    const plans = ['starter', 'professional', 'enterprise']
    const next = plans[(plans.indexOf(hotel.plan) + 1) % plans.length]
    if (!confirm(`Αλλαγή plan σε "${next}";`)) return
    await cp.upgradePlan(hotel.slug, next)
    setHotel(h => h ? { ...h, plan: next } : h)
  }

  const copySignageUrl = () => {
    navigator.clipboard.writeText(`https://ai-concierge-flame.vercel.app/signage?hotel=${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Υπολογισμός totals
  const totals = usage.reduce((acc, u) => ({
    sessions: acc.sessions + u.sessions,
    api_calls: acc.api_calls + u.api_calls,
    did_credits: acc.did_credits + u.did_credits_used,
    tokens: acc.tokens + u.tokens_used,
  }), { sessions: 0, api_calls: 0, did_credits: 0, tokens: 0 })

  const today = usage.find(u => u.date === new Date().toISOString().split('T')[0])

  if (loading) return <div style={{ color: '#666', padding: '32px' }}>Φόρτωση...</div>
  if (!hotel) return <div style={{ color: '#666', padding: '32px' }}>Hotel not found</div>

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <button onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', fontSize: '14px' }}>
          ← Dashboard
        </button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, fontSize: '22px' }}>{hotel.name}</h1>
            <span style={{ background: PLAN_COLORS[hotel.plan], color: '#fff', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', fontWeight: '600', textTransform: 'uppercase' }}>
              {hotel.plan}
            </span>
            <span style={{ background: hotel.active ? '#d4edda' : '#f8d7da', color: hotel.active ? '#155724' : '#721c24', fontSize: '11px', padding: '2px 8px', borderRadius: '12px' }}>
              {hotel.active ? '● Active' : '● Suspended'}
            </span>
          </div>
          <div style={{ color: '#6c757d', fontSize: '13px' }}>
            {hotel.location} · slug: <code style={{ background: '#f8f9fa', padding: '2px 6px', borderRadius: '4px' }}>{hotel.slug}</code>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={copySignageUrl}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            {copied ? '✓ Copied!' : '🔗 Signage URL'}
          </button>
          <button onClick={upgrade}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #0d6efd', color: '#0d6efd', background: '#fff', cursor: 'pointer', fontSize: '13px' }}>
            Upgrade Plan
          </button>
          <button onClick={toggle}
            style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: hotel.active ? '#dc3545' : '#28a745', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
            {hotel.active ? 'Suspend' : 'Activate'}
          </button>
        </div>
      </div>

      {/* Health Status */}
      <div style={{ background: health?.error ? '#f8d7da' : '#d4edda', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', color: health?.error ? '#721c24' : '#155724', marginBottom: '24px' }}>
        {health?.error ? '✗ Backend offline ή suspended' : `✓ Backend online · Plan: ${health?.plan}`}
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Sessions σήμερα', value: today?.sessions ?? 0, color: '#0d6efd' },
          { label: 'Συνολικές sessions', value: totals.sessions, color: '#6f42c1' },
          { label: 'D-ID credits used', value: totals.did_credits, color: '#fd7e14' },
          { label: 'Tokens used', value: totals.tokens.toLocaleString(), color: '#20c997' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: '#fff', borderRadius: '12px', padding: '20px', border: '1px solid #e9ecef' }}>
            <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '8px' }}>{label}</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Usage Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e9ecef', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e9ecef', fontWeight: '600', fontSize: '15px' }}>
          Ιστορικό χρήσης
        </div>
        {usage.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6c757d' }}>Δεν υπάρχουν δεδομένα ακόμα</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['Ημερομηνία', 'Sessions', 'API Calls', 'D-ID Credits', 'Tokens'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '1px solid #e9ecef' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {usage.slice(0, 30).map((u, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f8f9fa' }}>
                  <td style={{ padding: '12px 20px', color: '#495057' }}>{u.date}</td>
                  <td style={{ padding: '12px 20px', fontWeight: '600', color: '#0d6efd' }}>{u.sessions}</td>
                  <td style={{ padding: '12px 20px' }}>{u.api_calls}</td>
                  <td style={{ padding: '12px 20px', color: '#fd7e14' }}>{u.did_credits_used}</td>
                  <td style={{ padding: '12px 20px', color: '#20c997' }}>{u.tokens_used.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}