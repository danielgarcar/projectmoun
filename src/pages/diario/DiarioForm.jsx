import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const ETIQUETAS = ['bienestar', 'logro', 'dificultad', 'motivación', 'alimentación', 'entrenamiento', 'dosis', 'emociones']

const inputStyle = {
  width: '100%', background: '#1c1c1c',
  border: '1px solid #2a2a2a', borderRadius: 4,
  padding: '11px 12px', color: '#f5f5f5',
  fontSize: 15, fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle = {
  display: 'block', fontSize: 10, color: '#555555',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontFamily: 'Inter, sans-serif', marginBottom: 6,
}

export default function DiarioForm({ onClose, onSave, initialData }) {
  const hoy = new Date().toISOString().split('T')[0]

  const [fecha,      setFecha]      = useState(initialData?.fecha || hoy)
  const [contenido,  setContenido]  = useState(initialData?.contenido || '')
  const [etiquetas,  setEtiquetas]  = useState(initialData?.etiquetas || [])
  const [valoracion, setValoracion] = useState(initialData?.valoracion || null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState(null)

  function toggleEtiqueta(et) {
    setEtiquetas(prev => prev.includes(et) ? prev.filter(e => e !== et) : [...prev, et])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!contenido.trim()) { setError('Escribe algo en tu diario'); return }
    setLoading(true); setError(null)
    try {
      await onSave({
        fecha,
        contenido:  contenido.trim(),
        etiquetas,
        valoracion,
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100 }}
      />
      <motion.div key="drawer"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
          background: '#141414', borderTop: '1px solid #2a2a2a',
          borderRadius: '8px 8px 0 0', padding: '24px 20px 48px',
          maxHeight: '92dvh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#f5f5f5', margin: 0 }}>
            {initialData ? 'Editar entrada' : 'Nueva entrada'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Fecha */}
          <div>
            <label style={labelStyle}>Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
          </div>

          {/* Contenido */}
          <div>
            <label style={labelStyle}>¿Cómo ha ido el día?</label>
            <textarea rows={6} placeholder="Escribe libremente sobre tu día, cómo te sientes, qué lograste..."
              value={contenido} onChange={e => setContenido(e.target.value)}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
            />
          </div>

          {/* Etiquetas */}
          <div>
            <label style={labelStyle}>Etiquetas (opcional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ETIQUETAS.map(et => {
                const activo = etiquetas.includes(et)
                return (
                  <button key={et} type="button" onClick={() => toggleEtiqueta(et)}
                    style={{
                      padding: '6px 12px',
                      background: activo ? '#ffffff' : '#1c1c1c',
                      color:      activo ? '#0a0a0a' : '#555555',
                      border: `1px solid ${activo ? '#ffffff' : '#2a2a2a'}`,
                      borderRadius: 4, cursor: 'pointer',
                      fontSize: 12, fontFamily: 'Inter, sans-serif',
                      transition: 'all 150ms',
                    }}
                  >
                    {et}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Valoración */}
          <div>
            <label style={labelStyle}>Valoración del día</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setValoracion(n)}
                  style={{
                    flex: 1, padding: '10px 0',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: 22,
                    opacity: valoracion !== null ? (n <= valoracion ? 1 : 0.2) : 0.4,
                    transition: 'opacity 150ms',
                    filter: n <= (valoracion || 0) ? 'none' : 'grayscale(1)',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {error && <p style={{ color: '#ff3b30', fontSize: 13, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: '#ffffff', color: '#0a0a0a',
              border: 'none', borderRadius: 4,
              fontSize: 15, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={onClose}
            style={{
              width: '100%', padding: 14, background: 'none',
              color: '#f5f5f5', border: '1px solid #2a2a2a', borderRadius: 4,
              fontSize: 15, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}
