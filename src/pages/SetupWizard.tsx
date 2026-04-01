import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cp } from '../hooks/useApi'

const STEPS = ['Στοιχεία Hotel', 'Επιλογή Plan', 'Επιβεβαίωση']

export default function SetupWizard() {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ slug: '', name: '', location: '', plan: 'starter' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const navigate = useNavigate()

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const next = () => setStep(s => s + 1)
  const back = () => setStep(s => s - 1)

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      await cp.createHotel(form.slug, form.name, form.location, form.plan)
      setDone(true)
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Σφάλμα δημιουργίας hotel')
    } finally {
      setLoading(false)
    }
  }

  if (done) return (
    <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
      <h2>Hotel δημιουργήθηκε!</h2>
      <p style={{ color: '#666' }}>Το <strong>{form.name}</strong> είναι έτοιμο.</p>
      <p style={{ color: '#666', fontSize: '13px' }}>
        Signage URL: <code>https://ai-concierge-flame.vercel.app/signage?hotel={form.slug}</code>
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
        <button onClick={() => navigate(`/hotel/${form.slug}`)}
          style={{ background: '#c9a227', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
          Διαχείριση Hotel
        </button>
        <button onClick={() => navigate('/')}
          style={{ background: '#f8f9fa', border: '1px solid #dee2e6', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer' }}>
          Dashboard
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '22px', marginBottom: '8px' }}>Νέο Hotel</h1>

      {/* Steps indicator */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600',
              background: i <= step ? '#c9a227' : '#e9ecef',
              color: i <= step ? '#fff' : '#6c757d'
            }}>{i + 1}</div>
            <span style={{ fontSize: '13px', color: i === step ? '#1a1a2e' : '#6c757d', fontWeight: i === step ? '600' : '400' }}>{s}</span>
            {i < STEPS.length - 1 && <div style={{ width: '32px', height: '1px', background: '#dee2e6' }} />}
          </div>
        ))}
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '32px', border: '1px solid #e9ecef' }}>

        {/* Step 0 — Στοιχεία */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Στοιχεία ξενοδοχείου</h2>
            {[
              { label: 'Όνομα hotel', key: 'name', placeholder: 'Hotel Olympus Grand' },
              { label: 'Slug (μοναδικό ID)', key: 'slug', placeholder: 'olympus-grand' },
              { label: 'Τοποθεσία', key: 'location', placeholder: 'Thessaloniki, Greece' },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#495057' }}>{label}</label>
                <input value={form[key as keyof typeof form]}
                  onChange={e => update(key, e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dee2e6', fontSize: '14px', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Plan */}
        {step === 1 && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>Επιλογή Plan</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { value: 'starter', label: 'Starter', price: '€299/μήνα', desc: 'Έως 500 sessions, basic analytics' },
                { value: 'professional', label: 'Professional', price: '€499/μήνα', desc: 'Έως 2000 sessions, priority support' },
                { value: 'enterprise', label: 'Enterprise', price: '€799+/μήνα', desc: 'Unlimited, SLA 99.9%, custom integrations' },
              ].map(({ value, label, price, desc }) => (
                <div key={value} onClick={() => update('plan', value)}
                  style={{
                    padding: '16px', borderRadius: '8px', cursor: 'pointer',
                    border: form.plan === value ? '2px solid #c9a227' : '1px solid #dee2e6',
                    background: form.plan === value ? '#fffbf0' : '#fff'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600' }}>{label}</span>
                    <span style={{ color: '#c9a227', fontWeight: '600' }}>{price}</span>
                  </div>
                  <span style={{ fontSize: '13px', color: '#6c757d' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2 — Confirm */}
        {step === 2 && (
          <div>
            <h2 style={{ margin: '0 0 20px', fontSize: '18px' }}>Επιβεβαίωση</h2>
            <div style={{ background: '#f8f9fa', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              {[
                ['Όνομα', form.name],
                ['Slug', form.slug],
                ['Τοποθεσία', form.location],
                ['Plan', form.plan],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e9ecef' }}>
                  <span style={{ color: '#6c757d', fontSize: '14px' }}>{label}</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>{value}</span>
                </div>
              ))}
            </div>
            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
          <button onClick={step === 0 ? () => navigate('/') : back}
            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #dee2e6', background: '#fff', cursor: 'pointer' }}>
            {step === 0 ? 'Ακύρωση' : '← Πίσω'}
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next}
              disabled={step === 0 && (!form.name || !form.slug || !form.location)}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#c9a227', color: '#fff', cursor: 'pointer', fontWeight: '600', opacity: (step === 0 && (!form.name || !form.slug || !form.location)) ? 0.5 : 1 }}>
              Επόμενο →
            </button>
          ) : (
            <button onClick={submit} disabled={loading}
              style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#28a745', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>
              {loading ? 'Δημιουργία...' : '✓ Δημιουργία Hotel'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}