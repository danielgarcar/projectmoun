import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const PRESETS = [
  { label: 'Vaso', ml: 200 },
  { label: 'Vaso grande', ml: 300 },
  { label: 'Lata', ml: 330 },
  { label: 'Botella ½', ml: 500 },
  { label: 'Botella', ml: 750 },
  { label: '1 litro', ml: 1000 },
]

// SVG de botella de agua
function BottleIcon({ size = 24, color = '#0a0a0a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Tapón */}
      <rect x="9" y="2" width="6" height="3" rx="1" fill={color} />
      {/* Cuello */}
      <path d="M8 5 C7 5 6 6.5 6 8 L6 20 C6 21.1 6.9 22 8 22 L16 22 C17.1 22 18 21.1 18 20 L18 8 C18 6.5 17 5 16 5 Z" fill={color} />
      {/* Reflejo */}
      <line x1="9" y1="9" x2="9" y2="18" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// Botón flotante con forma de botella (silhouette pill)
function BottleButton({ onClick, pressed }) {
  return (
    <button
      aria-label="Registrar hidratación"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-h) + 16px)',
        right: 'calc(var(--fab-size) + 32px)',
        width: 48,
        height: 'var(--fab-size)',
        borderRadius: '24px',
        background: '#3a8ef6',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 49,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'transform 150ms',
        boxShadow: '0 0 0 1px rgba(58,142,246,0.4)',
        outline: 'none',
        gap: 2,
      }}
    >
      <BottleIcon size={22} color="#ffffff" />
    </button>
  )
}

export default function HidratacionForm({ onSave }) {
  const [open, setOpen]       = useState(false)
  const [custom, setCustom]   = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null) // { ml }
  const [pressed, setPressed] = useState(false)

  function openDrawer() {
    setPressed(true)
    setTimeout(() => setPressed(false), 150)
    setOpen(true)
  }

  async function handlePreset(ml) {
    setLoading(true)
    try {
      await onSave(ml)
      setFeedback({ ml })
      setTimeout(() => { setFeedback(null); setOpen(false) }, 900)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function handleCustom(e) {
    e.preventDefault()
    const ml = parseInt(custom, 10)
    if (!ml || ml <= 0) return
    await handlePreset(ml)
    setCustom('')
  }

  return (
    <>
      <BottleButton onClick={openDrawer} pressed={pressed} />

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="hid-bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => { if (!loading) setOpen(false) }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100 }}
            />

            {/* Drawer */}
            <motion.div
              key="hid-drawer"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
                background: '#141414', borderTop: '1px solid #2a2a2a',
                borderRadius: '8px 8px 0 0', padding: '24px 20px 48px',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'rgba(58,142,246,0.15)',
                    border: '1px solid rgba(58,142,246,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <BottleIcon size={16} color="#3a8ef6" />
                  </div>
                  <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#f5f5f5', margin: 0 }}>
                    Hidratación
                  </h2>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}
                >
                  ×
                </button>
              </div>

              {/* Feedback animado */}
              <AnimatePresence>
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    style={{
                      textAlign: 'center', marginBottom: 20,
                      padding: '12px', borderRadius: 4,
                      background: 'rgba(58,142,246,0.12)',
                      border: '1px solid rgba(58,142,246,0.3)',
                    }}
                  >
                    <span style={{ fontSize: 28, fontFamily: 'Space Mono, monospace', fontWeight: 700, color: '#3a8ef6' }}>
                      +{feedback.ml >= 1000 ? (feedback.ml / 1000).toFixed(1).replace('.', ',') + ' L' : feedback.ml + ' ml'}
                    </span>
                    <div style={{ fontSize: 11, color: '#3a8ef6', marginTop: 4, fontFamily: 'Inter, sans-serif' }}>registrado ✓</div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!feedback && (
                <>
                  {/* Presets en grid */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', marginBottom: 10 }}>Cantidad rápida</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {PRESETS.map(({ label, ml }) => (
                        <button
                          key={ml}
                          type="button"
                          disabled={loading}
                          onClick={() => handlePreset(ml)}
                          style={{
                            padding: '14px 8px',
                            background: '#1c1c1c',
                            border: '1px solid #2a2a2a',
                            borderRadius: 4,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', gap: 4,
                            transition: 'border-color 150ms, background 150ms',
                            opacity: loading ? 0.5 : 1,
                          }}
                          onPointerDown={e => { e.currentTarget.style.background = '#2a2a2a'; e.currentTarget.style.borderColor = '#3a8ef6' }}
                          onPointerUp={e => { e.currentTarget.style.background = '#1c1c1c'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                          onPointerLeave={e => { e.currentTarget.style.background = '#1c1c1c'; e.currentTarget.style.borderColor = '#2a2a2a' }}
                        >
                          {/* Mini botella SVG estilizada */}
                          <div style={{ position: 'relative', width: 18, height: 26 }}>
                            <svg width="18" height="26" viewBox="0 0 18 26" fill="none">
                              <rect x="6" y="0" width="6" height="3" rx="1" fill="#3a8ef6" opacity="0.6" />
                              <path d="M4 3 C3 3 2 4.5 2 6 L2 22 C2 23.1 2.9 24 4 24 L14 24 C15.1 24 16 23.1 16 22 L16 6 C16 4.5 15 3 14 3 Z" fill="#1a3a5c" stroke="#3a8ef6" strokeWidth="1" />
                              {/* Nivel de llenado proporcional */}
                              <clipPath id={`fill-${ml}`}>
                                <path d="M4 3 C3 3 2 4.5 2 6 L2 22 C2 23.1 2.9 24 4 24 L14 24 C15.1 24 16 23.1 16 22 L16 6 C16 4.5 15 3 14 3 Z" />
                              </clipPath>
                              <rect
                                x="2"
                                y={24 - (18 * Math.min(ml / 1000, 1))}
                                width="14"
                                height={18 * Math.min(ml / 1000, 1)}
                                fill="#3a8ef6"
                                opacity="0.5"
                                clipPath={`url(#fill-${ml})`}
                              />
                            </svg>
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Space Mono, monospace', color: '#f5f5f5' }}>
                            {ml >= 1000 ? (ml / 1000).toFixed(1).replace('.', ',') + 'L' : ml + 'ml'}
                          </span>
                          <span style={{ fontSize: 9, color: '#555', fontFamily: 'Inter, sans-serif', textAlign: 'center' }}>
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input personalizado */}
                  <form onSubmit={handleCustom}>
                    <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif', marginBottom: 8 }}>Cantidad personalizada (ml)</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        type="number" min="1" max="5000" step="1"
                        placeholder="350"
                        value={custom}
                        onChange={e => setCustom(e.target.value)}
                        style={{
                          flex: 1,
                          background: '#1c1c1c',
                          border: '1px solid #2a2a2a',
                          borderRadius: 4,
                          padding: '12px 14px',
                          color: '#f5f5f5',
                          fontSize: 18,
                          fontFamily: 'Space Mono, monospace',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={loading || !custom}
                        style={{
                          padding: '12px 20px',
                          background: custom ? '#3a8ef6' : '#1c1c1c',
                          border: '1px solid ' + (custom ? '#3a8ef6' : '#2a2a2a'),
                          borderRadius: 4,
                          color: custom ? '#fff' : '#555',
                          fontSize: 14, fontWeight: 700,
                          fontFamily: 'Inter, sans-serif',
                          cursor: custom ? 'pointer' : 'not-allowed',
                          transition: 'all 200ms',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        + Añadir
                      </button>
                    </div>
                  </form>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
