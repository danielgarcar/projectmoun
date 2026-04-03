import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import MuscleMap, { GRUPO_SIDE } from '../../components/ui/MuscleMap.jsx'

const TIPOS_SESION = ['fuerza', 'cardio', 'flexibilidad', 'caminata', 'mixto', 'otro']
const GRUPOS       = ['pecho', 'espalda', 'piernas', 'hombros', 'biceps', 'triceps', 'core', 'cardio', 'full_body']
const SENSACIONES  = ['fácil', 'moderada', 'difícil', 'fallo']

const inputStyle = {
  width: '100%', background: '#1c1c1c',
  border: '1px solid #2a2a2a', borderRadius: 4,
  padding: '11px 12px', color: '#f5f5f5',
  fontSize: 16, fontFamily: 'Inter, sans-serif',
  outline: 'none', boxSizing: 'border-box',
  WebkitAppearance: 'none',
}
const labelStyle = {
  display: 'block', fontSize: 10, color: '#555555',
  textTransform: 'uppercase', letterSpacing: '0.1em',
  fontFamily: 'Inter, sans-serif', marginBottom: 6,
}
const sectionTitle = {
  fontSize: 10, color: '#555555', textTransform: 'uppercase',
  letterSpacing: '0.1em', fontFamily: 'Inter, sans-serif',
  marginBottom: 10, marginTop: 4,
}

/* ─── Sub-form: una serie ─── */
function SerieRow({ serie, idx, onChange, onDelete }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: '#555', fontFamily: 'Space Mono, monospace', width: 14, flexShrink: 0 }}>{idx + 1}</span>
      <input type="number" placeholder="Reps" min="0" value={serie.reps}
        onChange={e => onChange({ ...serie, reps: e.target.value })}
        style={{ ...inputStyle, width: 64, padding: '8px', fontSize: 14, fontFamily: 'Space Mono, monospace', textAlign: 'center' }}
      />
      <input type="number" placeholder="Peso" min="0" step="0.5" value={serie.peso}
        onChange={e => onChange({ ...serie, peso: e.target.value })}
        style={{ ...inputStyle, width: 74, padding: '8px', fontSize: 14, fontFamily: 'Space Mono, monospace', textAlign: 'center' }}
      />
      <select value={serie.sensacion} onChange={e => onChange({ ...serie, sensacion: e.target.value })}
        style={{ ...inputStyle, flex: 1, padding: '8px 6px', fontSize: 12 }}
      >
        <option value="">—</option>
        {SENSACIONES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="button" onClick={onDelete}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px', lineHeight: 1, flexShrink: 0 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  )
}

/* ─── Sub-form: un ejercicio ─── */
function EjercicioBlock({ ej, idx, onChange, onDelete, historialNombres = [] }) {
  const listId = `ej-historial-${idx}`

  function addSerie() {
    onChange({ ...ej, series: [...ej.series, { reps: '', peso: '', sensacion: '', rir: '' }] })
  }
  function updateSerie(i, updated) {
    const s = [...ej.series]; s[i] = updated
    onChange({ ...ej, series: s })
  }
  function deleteSerie(i) {
    onChange({ ...ej, series: ej.series.filter((_, si) => si !== i) })
  }

  return (
    <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 4, padding: '12px', marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* Input nombre con datalist para autocompletado */}
          <input
            type="text"
            list={listId}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder={`Ejercicio ${idx + 1}`}
            value={ej.nombre}
            onChange={e => onChange({ ...ej, nombre: e.target.value })}
            style={{ ...inputStyle, fontWeight: 600, marginBottom: 6, fontSize: 16 }}
          />
          {historialNombres.length > 0 && (
            <datalist id={listId}>
              {historialNombres.map(n => <option key={n} value={n} />)}
            </datalist>
          )}
          <MuscleMap
            mode="select"
            selectedGroup={ej.grupo_muscular}
            onSelect={g => onChange({ ...ej, grupo_muscular: g })}
            scale={0.65}
            showToggle={true}
          />
        </div>
        <button type="button" onClick={onDelete}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '4px', flexShrink: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          </svg>
        </button>
      </div>

      {/* Cabecera series */}
      {ej.series.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 6, paddingLeft: 20 }}>
          {['Reps', 'Peso (kg)', 'Sens.'].map(h => (
            <span key={h} style={{ fontSize: 9, color: '#444', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.08em',
              width: h === 'Sens.' ? 'auto' : h === 'Reps' ? 64 : 74, flex: h === 'Sens.' ? 1 : 'none' }}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Series */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        {ej.series.map((s, i) => (
          <SerieRow key={i} serie={s} idx={i} onChange={u => updateSerie(i, u)} onDelete={() => deleteSerie(i)} />
        ))}
      </div>

      <button type="button" onClick={addSerie}
        style={{ background: 'none', border: '1px dashed #2a2a2a', borderRadius: 4,
          color: '#555', fontSize: 12, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
          padding: '6px 12px', width: '100%' }}>
        + Serie
      </button>
    </div>
  )
}

/* ─── Formulario principal de sesión ─── */
export default function SesionForm({ onClose, onSave, initialData, historialNombres = [] }) {
  const hoy = new Date().toISOString().slice(0, 16)

  const [fechaInicio,  setFechaInicio]  = useState(initialData?.fecha_inicio?.slice(0, 16) || hoy)
  const [tipo,         setTipo]         = useState(initialData?.tipo || null)
  const [duracion,     setDuracion]     = useState(initialData?.duracion_min?.toString() || '')
  const [sensacion,    setSensacion]    = useState(initialData?.sensacion_general || null)
  const [energia,      setEnergia]      = useState(initialData?.energia_antes || null)
  const [cals,         setCals]         = useState(initialData?.calorias_quemadas?.toString() || '')
  const [notas,        setNotas]        = useState(initialData?.notas || '')
  const [ejercicios,   setEjercicios]   = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  function addEjercicio() {
    setEjercicios(prev => [...prev, { nombre: '', grupo_muscular: '', series: [] }])
  }
  function updateEj(i, updated) { setEjercicios(prev => prev.map((e, ei) => ei === i ? updated : e)) }
  function deleteEj(i)           { setEjercicios(prev => prev.filter((_, ei) => ei !== i)) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!tipo) { setError('Selecciona el tipo de sesión'); return }
    setLoading(true); setError(null)
    try {
      await onSave({
        sesion: {
          fecha_inicio:       fechaInicio,
          tipo,
          duracion_min:       duracion ? parseInt(duracion, 10) : null,
          sensacion_general:  sensacion,
          energia_antes:      energia,
          calorias_quemadas:  cals ? parseInt(cals, 10) : null,
          notas:              notas.trim() || null,
        },
        ejercicios,
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
            Nueva sesión
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#555', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Fecha */}
          <div>
            <label style={labelStyle}>Fecha y hora de inicio</label>
            <input type="datetime-local" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={inputStyle} />
          </div>

          {/* Tipo */}
          <div>
            <label style={labelStyle}>Tipo de sesión</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {TIPOS_SESION.map(t => (
                <button key={t} type="button" onClick={() => setTipo(t)}
                  style={{
                    padding: '9px 4px',
                    background: tipo === t ? '#ffffff' : '#1c1c1c',
                    color:      tipo === t ? '#0a0a0a' : '#888',
                    border: `1px solid ${tipo === t ? '#ffffff' : '#2a2a2a'}`,
                    borderRadius: 4, cursor: 'pointer',
                    fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
                    fontFamily: 'Inter, sans-serif', transition: 'all 150ms',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Duración y calorías */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={labelStyle}>Duración (min)</label>
              <input type="number" min="1" placeholder="45" value={duracion} onChange={e => setDuracion(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'Space Mono, monospace', fontSize: 18 }} />
            </div>
            <div>
              <label style={labelStyle}>Calorías quemadas</label>
              <input type="number" min="0" placeholder="300" value={cals} onChange={e => setCals(e.target.value)}
                style={{ ...inputStyle, fontFamily: 'Space Mono, monospace', fontSize: 18 }} />
            </div>
          </div>

          {/* Energía y sensación */}
          <div>
            <label style={labelStyle}>Energía antes (1–10)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" onClick={() => setEnergia(n)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: energia === n ? '#ffffff' : '#1c1c1c',
                    color:      energia === n ? '#0a0a0a' : '#555',
                    border: `1px solid ${energia === n ? '#ffffff' : '#2a2a2a'}`,
                    borderRadius: 3, cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'Space Mono, monospace',
                    transition: 'all 100ms',
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Sensación post-entreno (1–10)</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <button key={n} type="button" onClick={() => setSensacion(n)}
                  style={{
                    flex: 1, padding: '8px 0',
                    background: sensacion === n ? '#30d158' : '#1c1c1c',
                    color:      sensacion === n ? '#0a0a0a' : '#555',
                    border: `1px solid ${sensacion === n ? '#30d158' : '#2a2a2a'}`,
                    borderRadius: 3, cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, fontFamily: 'Space Mono, monospace',
                    transition: 'all 100ms',
                  }}
                >{n}</button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label style={labelStyle}>Notas (opcional)</label>
            <textarea rows={2} placeholder="Cómo me sentí, contexto..."
              value={notas} onChange={e => setNotas(e.target.value)}
              style={{ ...inputStyle, resize: 'none' }} />
          </div>

          {/* Ejercicios */}
          <div>
            <div style={sectionTitle}>Ejercicios</div>
            {ejercicios.map((ej, i) => (
              <EjercicioBlock key={i} ej={ej} idx={i} onChange={u => updateEj(i, u)} onDelete={() => deleteEj(i)} historialNombres={historialNombres} />
            ))}
            <button type="button" onClick={addEjercicio}
              style={{
                width: '100%', padding: '10px', background: 'none',
                border: '1px dashed #2a2a2a', borderRadius: 4,
                color: '#888', fontSize: 13, fontFamily: 'Inter, sans-serif', cursor: 'pointer',
              }}
            >
              + Añadir ejercicio
            </button>
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
            {loading ? 'Guardando...' : 'Guardar sesión'}
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
