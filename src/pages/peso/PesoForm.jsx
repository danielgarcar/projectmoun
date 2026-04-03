import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStorage } from '../../hooks/useStorage.js'

const inputStyle = {
  width: '100%',
  background: '#141414',
  border: '1px solid #2a2a2a',
  borderRadius: 4,
  padding: '12px',
  color: '#f5f5f5',
  fontSize: 16,
  fontFamily: 'Inter, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function PesoForm({ onClose, onSave, initialData, userId }) {
  const today = new Date().toISOString().split('T')[0]
  const { uploadPhoto } = useStorage()

  const [fecha, setFecha] = useState(initialData?.fecha || today)
  const [peso, setPeso] = useState(initialData?.peso || '')
  const [nota, setNota] = useState(initialData?.nota || '')
  const [foto, setFoto]           = useState(null)           // File a subir
  const [fotoPreview, setFotoPreview] = useState(initialData?.foto_url || null)
  const [fotoUploading, setFotoUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pesoFocused, setPesoFocused] = useState(false)
  const [fechaFocused, setFechaFocused] = useState(false)
  const [notaFocused, setNotaFocused] = useState(false)

  function handleFotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Solo se permiten imágenes'); return }
    if (file.size > 10 * 1024 * 1024) { setError('La imagen no puede superar 10 MB'); return }
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  function removeFoto() {
    setFoto(null)
    setFotoPreview(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!peso || isNaN(parseFloat(peso))) {
      setError('Introduce un peso valido')
      return
    }
    setLoading(true)
    setError(null)
    try {
      let foto_url = initialData?.foto_url || null
      // Subir foto si se seleccionó una nueva
      if (foto && userId) {
        setFotoUploading(true)
        foto_url = await uploadPhoto(foto, userId, 'peso')
        setFotoUploading(false)
      }
      await onSave({ fecha, peso: parseFloat(peso), nota: nota.trim() || null, foto_url })
      onClose()
    } catch (err) {
      setError(err.message || 'Error al guardar el registro')
      setFotoUploading(false)
    } finally {
      setLoading(false)
    }
  }

  function handleBackdropClick(e) {
    // Only close if clicking the backdrop itself, not the form
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 100,
        }}
      />

      {/* Drawer */}
      <motion.div
        key="drawer"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 101,
          background: '#141414',
          borderTop: '1px solid #2a2a2a',
          borderRadius: '8px 8px 0 0',
          padding: '24px 20px 40px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}
        >
          <h2
            style={{
              fontFamily: '"Space Grotesk", sans-serif',
              fontSize: 20,
              fontWeight: 700,
              color: '#f5f5f5',
              margin: 0,
            }}
          >
            {initialData ? 'Editar peso' : 'Registrar peso'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#888888',
              fontSize: 24,
              cursor: 'pointer',
              lineHeight: 1,
              padding: '0 4px',
            }}
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Fecha */}
          <div>
            <label
              style={{
                fontSize: 12,
                color: '#888888',
                display: 'block',
                marginBottom: 6,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              FECHA
            </label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              onFocus={() => setFechaFocused(true)}
              onBlur={() => setFechaFocused(false)}
              style={{
                ...inputStyle,
                borderColor: fechaFocused ? '#ffffff' : '#2a2a2a',
              }}
            />
          </div>

          {/* Peso */}
          <div>
            <label
              style={{
                fontSize: 12,
                color: '#888888',
                display: 'block',
                marginBottom: 6,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              PESO (kg)
            </label>
            <input
              type="number"
              step="0.1"
              min="20"
              max="300"
              placeholder="87.5"
              value={peso}
              onChange={e => setPeso(e.target.value)}
              onFocus={() => setPesoFocused(true)}
              onBlur={() => setPesoFocused(false)}
              style={{
                ...inputStyle,
                fontSize: 28,
                fontFamily: '"Courier New", monospace',
                fontWeight: 600,
                borderColor: pesoFocused ? '#ffffff' : '#2a2a2a',
              }}
            />
          </div>

          {/* Nota */}
          <div>
            <label
              style={{
                fontSize: 12,
                color: '#888888',
                display: 'block',
                marginBottom: 6,
                fontFamily: 'Inter, sans-serif',
                letterSpacing: '0.05em',
              }}
            >
              NOTA (opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Como me siento..."
              value={nota}
              onChange={e => setNota(e.target.value)}
              onFocus={() => setNotaFocused(true)}
              onBlur={() => setNotaFocused(false)}
              style={{
                ...inputStyle,
                resize: 'none',
                borderColor: notaFocused ? '#ffffff' : '#2a2a2a',
              }}
            />
          </div>

          {/* Foto corporal */}
          <div>
            <label
              style={{
                fontSize: 12, color: '#888888', display: 'block',
                marginBottom: 6, fontFamily: 'Inter, sans-serif', letterSpacing: '0.05em',
              }}
            >
              FOTO (opcional)
            </label>

            {fotoPreview ? (
              /* Preview de la foto */
              <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', lineHeight: 0 }}>
                <img
                  src={fotoPreview} alt="Foto corporal"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button" onClick={removeFoto}
                  style={{
                    position: 'absolute', top: 8, right: 8,
                    background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                    width: 28, height: 28, cursor: 'pointer', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              /* Selector de archivo */
              <label
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  width: '100%', padding: '16px 12px',
                  background: '#141414', border: '1px dashed #2a2a2a', borderRadius: 4,
                  cursor: 'pointer', color: '#555555', fontSize: 13,
                  fontFamily: 'Inter, sans-serif', boxSizing: 'border-box',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                Añadir foto
                <input
                  type="file" accept="image/*" capture="environment"
                  onChange={handleFotoChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>

          {/* Error */}
          {error && (
            <p style={{ color: '#ff3b30', fontSize: 13, margin: 0, fontFamily: 'Inter, sans-serif' }}>
              {error}
            </p>
          )}

          {/* Guardar */}
          <button
            type="submit"
            disabled={loading || fotoUploading}
            style={{
              width: '100%',
              background: '#ffffff',
              color: '#0a0a0a',
              border: 'none',
              borderRadius: 4,
              padding: '14px',
              fontSize: 15,
              fontWeight: 700,
              fontFamily: 'Inter, sans-serif',
              cursor: (loading || fotoUploading) ? 'not-allowed' : 'pointer',
              opacity: (loading || fotoUploading) ? 0.7 : 1,
              transition: 'opacity 200ms',
            }}
          >
            {fotoUploading ? 'Subiendo foto...' : loading ? 'Guardando...' : 'Guardar'}
          </button>

          {/* Cancelar */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              background: 'none',
              color: '#f5f5f5',
              border: '1px solid #2a2a2a',
              borderRadius: 4,
              padding: '14px',
              fontSize: 15,
              fontFamily: 'Inter, sans-serif',
              cursor: 'pointer',
              transition: 'border-color 200ms',
            }}
          >
            Cancelar
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  )
}
