import { Outlet, NavLink } from 'react-router-dom'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ background: '#1a1a2e', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '32px', height: '56px' }}>
        <div style={{ color: '#c9a227', fontWeight: 'bold', fontSize: '16px', letterSpacing: '1px' }}>
          ⚡ Digital Center Control
        </div>
        {[
          { to: '/', label: 'Dashboard' },
          { to: '/setup', label: '+ New Hotel' },
        ].map(({ to, label }) => (
          <NavLink key={to} to={to} end
            style={({ isActive }) => ({
              color: isActive ? '#c9a227' : '#aaa',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: isActive ? '600' : '400'
            })}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  )
}