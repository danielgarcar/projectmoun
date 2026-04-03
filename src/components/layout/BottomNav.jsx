import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/dashboard',
    label: 'Inicio',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/peso',
    label: 'Peso',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13 17 8 12 2 18"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    to: '/dosis',
    label: 'Dosis',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    ),
  },
  {
    to: '/alimentacion',
    label: 'Comida',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 2v20"/>
        <path d="M6 2v6a3 3 0 0 0 3 3v13"/>
        <path d="M3 2v6"/>
        <path d="M9 2v6"/>
      </svg>
    ),
  },
  {
    to: '/entreno',
    label: 'Entreno',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="12" r="3"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
        <line x1="3" y1="8" x2="3" y2="16"/>
        <line x1="21" y1="8" x2="21" y2="16"/>
      </svg>
    ),
  },
  {
    to: '/diario',
    label: 'Diario',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'var(--bottom-nav-h)',
        background: 'rgba(10,10,10,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--color-border)',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <ul style={{ display: 'flex', height: '100%', alignItems: 'stretch', justifyContent: 'space-around', listStyle: 'none', margin: 0, padding: 0 }}>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <li key={to} style={{ flex: 1 }}>
            <NavLink
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '3px',
                color: isActive ? 'var(--color-accent-white)' : 'var(--color-text-muted)',
                textDecoration: 'none',
                transition: 'color 150ms',
              })}
            >
              {icon}
              <span style={{ fontSize: '9px', fontFamily: 'var(--font-body)', fontWeight: 500, letterSpacing: '0.02em' }}>
                {label}
              </span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
