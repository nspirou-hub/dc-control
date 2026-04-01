import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { cp } from '../hooks/useApi'

export default function HotelDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [health, setHealth] = useState<any>(null)

  useEffect(() => {
    if (slug) cp.healthCheck(slug).then(r => setHealth(r.data)).catch(() => setHealth({ error: true }))
  }, [slug])

  return (
    <div>
      <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6c757d', marginBottom: '16px' }}>← Dashboard</button>
      <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>{slug}</h1>
      {health && (
        <div style={{ background: health.error ? '#f8d7da' : '#d4edda', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', color: health.error ? '#721c24' : '#155724' }}>
          {health.error ? 'Hotel offline ή suspended' : `✓ Online · Plan: ${health.plan}`}
        </div>
      )}
      <p style={{ color: '#6c757d', marginTop: '24px' }}>Monitoring & detailed management — επόμενο βήμα!</p>
    </div>
  )
}