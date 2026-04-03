import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const TIPOS = ['desayuno', 'almuerzo', 'cena', 'snack']

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
  display: 'block', fontSize: 10,
  color: '#555555', textTransform: 'uppercase',
  letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif',
  marginBottom: 6,
}

function ScaleSelector({ value, onChange, label, min = 1, max = 5 }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: 6 }}>
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
          <button
            key={n} type="button"
            onClick={() => onChange(n)}
            style={{
              flex: 1, padding: '10px 4px',
              background: value === n ? '#ffffff' : '#1c1c1c',
              color:      value === n ? '#0a0a0a' : '#555555',
              border: `1px solid ${value === n ? '#ffffff' : '#2a2a2a'}`,
              borderRadius: 4, cursor: 'pointer',
              fontSize: 14, fontWeight: 700,
              fontFamily: 'Space Mono, monospace',
              transition: 'all 150ms',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ComidaForm({ onClose, onSave, initialData }) {
  const hoy = new Date().toISOString().slice(0, 16)

  const [fecha,    setFecha]    = useState(initialData?.fecha?.slice(0, 16) || hoy)
  const [tipo,     setTipo]     = useState(initialData?.tipo || null)
  const [desc,     setDesc]     = useState(initialData?.descripcion || '')
  const [calorias, setCalorias] = useState(initialData?.calorias?.toString() || '')
  const [hambre,   setHambre]   = useState(initialData?.hambre_antes || null)
  const [saciedad, setSaciedad] = useState(initialData?.saciedad_despues || null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!tipo)       { setError('Selecciona el tipo de comida'); return }
    if (!desc.trim()) { setError('Escribe una descripción'); return }
    setLoading(true); setError(null)
    try {
      await onSave({
        fecha,
        tipo,
        descripcion:       desc.trim(),
        calorias:          calorias ? parseInt(calorias, 10) : null,
        hambre_antes:      hambre,
        saciedad_despues:  saciedad,
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
            {initialData ? 'Editar comida' : 'Registrar comida'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Fecha */}
          <div>
            <label style={labelStyle}>Fecha y hora</label>
            <input type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} />
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>Tipo de comida</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {TIPOS.map(t => (
                <button key={t} type="button" onClick={() => setTipo(t)}
                  style={{
                    padding: '11px 4px',
                    background: tipo === t ? '#ffffff' : '#1c1c1c',
                    color:      tipo === t ? '#0a0a0a' : '#888888',
                    border: `1px solid ${tipo === t ? '#ffffff' : '#2a2a2a'}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif', transition: 'all 150ms',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea rows={3} placeholder="Pollo con arroz, ensalada verde..."
              value={desc} onChange={e => setDesc(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Calorías */}
          <div>
            <label style={labelStyle}>Calorías estimadas (opcional)</label>
            <input type="number" min="0" max="5000" placeholder="450"
              value={calorias} onChange={e => setCalorias(e.target.value)}
              style={{ ...inputStyle, fontFamily: 'Space Mono, monospace', fontSize: 20 }}
            />
          </div>

          {/* Hambre y saciedad */}
          <ScaleSelector label="Hambre antes (1 = nada · 5 = mucha)" value={hambre} onChange={setHambre} />
          <ScaleSelector label="Saciedad después (1 = nada · 5 = lleno)" value={saciedad} onChange={setSaciedad} />

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
