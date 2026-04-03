import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const DOSIS_VALIDAS = [2.5, 5, 7.5, 10, 12.5, 15]
const ZONAS        = ['abdomen', 'muslo', 'brazo']
const EFECTOS      = ['náuseas', 'fatiga', 'dolor de cabeza', 'estreñimiento', 'otros']

const inputStyle = {
  width: '100%',
  background: '#1c1c1c',
  border: '1px solid #2a2a2a',
  borderRadius: 4,
  padding: '11px 12px',
  color: '#f5f5f5',
  fontSize: 15,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 10,
  color: '#555555',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontFamily: 'Inter, sans-serif',
  marginBottom: 6,
}

export default function DosisForm({ onClose, onSave, initialData }) {
  const hoy = new Date().toISOString().slice(0, 16)

  const [fecha,    setFecha]    = useState(initialData?.fecha?.slice(0, 16) || hoy)
  const [dosis,    setDosis]    = useState(initialData?.dosis_mg || null)
  const [zona,     setZona]     = useState(initialData?.zona || null)
  const [efectos,  setEfectos]  = useState(initialData?.efectos_secundarios || [])
  const [notas,    setNotas]    = useState(initialData?.notas || '')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  function toggleEfecto(ef) {
    setEfectos(prev =>
      prev.includes(ef) ? prev.filter(e => e !== ef) : [...prev, ef]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!dosis) { setError('Selecciona la dosis'); return }
    if (!zona)  { setError('Selecciona la zona de inyección'); return }
    setLoading(true); setError(null)
    try {
      await onSave({
        fecha,
        dosis_mg:              dosis,
        zona,
        efectos_secundarios:   efectos,
        notas:                 notas.trim() || null,
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
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100 }}
      />
      <motion.div
        key="drawer"
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 101,
          background: '#141414', borderTop: '1px solid #2a2a2a',
          borderRadius: '8px 8px 0 0', padding: '24px 20px 48px',
          maxHeight: '92dvh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#f5f5f5', margin: 0 }}>
            {initialData ? 'Editar dosis' : 'Nueva dosis'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Fecha y hora */}
          <div>
            <label style={labelStyle}>Fecha y hora</label>
            <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
          </div>

          {/* Dosis */}
          <div>
            <label style={labelStyle}>Dosis (mg)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DOSIS_VALIDAS.map(d => (
                <button
                  key={d} type="button"
                  onClick={() => setDosis(d)}
                  style={{
                    padding: '12px 4px',
                    background: dosis === d ? '#ffffff' : '#1c1c1c',
                    color:      dosis === d ? '#0a0a0a' : '#888888',
                    border: `1px solid ${dosis === d ? '#ffffff' : '#2a2a2a'}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 15, fontWeight: 700,
                    fontFamily: 'Space Mono, monospace',
                    transition: 'all 150ms',
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Zona */}
          <div>
            <label style={labelStyle}>Zona de inyección</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {ZONAS.map(z => (
                <button
                  key={z} type="button"
                  onClick={() => setZona(z)}
                  style={{
                    flex: 1, padding: '10px 4px',
                    background: zona === z ? '#ffffff' : '#1c1c1c',
                    color:      zona === z ? '#0a0a0a' : '#888888',
                    border: `1px solid ${zona === z ? '#ffffff' : '#2a2a2a'}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 150ms',
                  }}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Efectos secundarios */}
          <div>
            <label style={labelStyle}>Efectos secundarios (opcional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {EFECTOS.map(ef => {
                const activo = efectos.includes(ef)
                return (
                  <button
                    key={ef} type="button"
                    onClick={() => toggleEfecto(ef)}
                    style={{
                      padding: '6px 12px',
                      background: activo ? 'rgba(255,59,48,0.15)' : '#1c1c1c',
                      color:      activo ? '#ff3b30' : '#555555',
                      border: `1px solid ${activo ? '#ff3b30' : '#2a2a2a'}`,
                      borderRadius: 4, cursor: 'pointer',
                      fontSize: 12, fontFamily: 'Inter, sans-serif',
                      transition: 'all 150ms',
                    }}
                  >
                    {ef}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea
              rows={2} placeholder="Cómo me sentí, observaciones..."
              value={notas} onChange={e => setNotas(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {error && (
            <p style={{ color: '#ff3b30', fontSize: 13, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              width: '100%', padding: 14,
              background: '#ffffff', color: '#0a0a0a',
              border: 'none', borderRadius: 4,
              fontSize: 15, fontWeight: 700, fontFamily: 'Inter, sans-serif',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>

          <button
            type="button" onClick={onClose}
            style={{
              width: '100%', padding: 14,
              background: 'none', color: '#f5f5f5',
              border: '1px solid #2a2a2a', borderRadius: 4,
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
