import { useState } from 'react';

export default function FAB({ onClick, label = 'Acción principal', icon, disabled = false }) {
  const [pressed, setPressed] = useState(false);

  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={() => {
        if (disabled) return;
        setPressed(true);
        setTimeout(() => setPressed(false), 150);
        onClick?.();
      }}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-h) + 16px)',
        right: '20px',
        width: 'var(--fab-size)',
        height: 'var(--fab-size)',
        borderRadius: '50%',
        background: 'var(--color-accent-white)',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 49,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'transform 150ms',
        opacity: disabled ? 0.4 : 1,
        outline: 'none',
      }}
    >
      {icon ?? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
             stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5"  y1="12" x2="19" y2="12" />
        </svg>
      )}
    </button>
  );
}
