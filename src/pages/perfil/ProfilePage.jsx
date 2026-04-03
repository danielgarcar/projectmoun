import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { usePesos } from '../../hooks/usePesos.js';
import { useTheme } from '../../hooks/useTheme.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

const inputStyle = {
  width: '100%',
  background: 'var(--color-surface-hover)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
  padding: '11px 12px',
  color: 'var(--color-text-primary)',
  fontSize: '15px',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  boxSizing: 'border-box',
};

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{
        display: 'block', fontSize: '10px',
        color: 'var(--color-text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '6px',
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const navigate   = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading, updateProfile } = useProfile(user?.id);
  const { pesoActual } = usePesos(user?.id);
  const { theme, isDark, toggle: toggleTheme } = useTheme(profile?.tema);

  const [nombre,      setNombre]      = useState('');
  const [pesoObj,     setPesoObj]     = useState('');
  const [pesoIni,     setPesoIni]     = useState('');
  const [fechaIni,    setFechaIni]    = useState('');
  const [unidad,      setUnidad]      = useState('kg');
  const [sexo,        setSexo]        = useState('');
  const [altura,      setAltura]      = useState('');
  const [consumoBas,  setConsumoBas]  = useState('');
  const [hidratObj,   setHidratObj]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);
  const [error,     setError]     = useState('');

  // Hidrata los campos cuando el perfil carga desde la BD
  useEffect(() => {
    if (!profile) return;
    setNombre(profile.nombre || '');
    setPesoObj(profile.peso_objetivo_kg?.toString() || '');
    setPesoIni(profile.peso_inicial_kg?.toString() || '');
    setFechaIni(profile.fecha_inicio_tratamiento || '');
    setUnidad(profile.unidad_peso || 'kg');
    setSexo(profile.sexo || '');
    setAltura(profile.altura_cm?.toString() || '');
    setConsumoBas(profile.consumo_basal_kcal?.toString() || '');
    setHidratObj(profile.hidratacion_objetivo_ml?.toString() || '');
  }, [profile]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await updateProfile({
        nombre:                   nombre.trim() || null,
        peso_objetivo_kg:         pesoObj ? parseFloat(pesoObj) : null,
        peso_inicial_kg:          pesoIni ? parseFloat(pesoIni) : null,
        fecha_inicio_tratamiento: fechaIni || null,
        unidad_peso:              unidad,
        sexo:                     sexo || null,
        altura_cm:                altura ? parseInt(altura, 10) : null,
        consumo_basal_kcal:       consumoBas ? parseInt(consumoBas, 10) : null,
        hidratacion_objetivo_ml:  hidratObj ? parseInt(hidratObj, 10) : null,
        tema:                     theme,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  // ── IMC calculado con peso actual + altura del perfil ──────────
  const imcData = (() => {
    const h = parseFloat(altura);
    // Usa peso actual de BD; si no hay todavía, cae al peso inicial del form
    const w = parseFloat(pesoActual) || parseFloat(pesoIni) || null;
    if (!h || !w || h < 100 || h > 250 || w < 20) return null;
    const hm = h / 100;
    const imc = parseFloat((w / (hm * hm)).toFixed(1));
    const usandoActual = !!parseFloat(pesoActual);
    let categoria, color;
    if (imc < 18.5)      { categoria = 'Bajo peso';    color = '#3a8ef6'; }
    else if (imc < 25)   { categoria = 'Normal';        color = 'var(--color-accent-green)'; }
    else if (imc < 30)   { categoria = 'Sobrepeso';     color = '#f5a623'; }
    else if (imc < 35)   { categoria = 'Obesidad I';    color = 'var(--color-accent-red)'; }
    else if (imc < 40)   { categoria = 'Obesidad II';   color = 'var(--color-accent-red)'; }
    else                 { categoria = 'Obesidad III';  color = 'var(--color-accent-red)'; }
    return { imc, categoria, color, peso: w, usandoActual };
  })();

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Perfil" />

      <main style={{
        flex: 1, overflowY: 'auto',
        padding: '20px var(--page-padding-h)',
        paddingBottom: 'calc(var(--bottom-nav-h) + 40px)',
      }}>

        {/* Avatar / email */}
        <div style={{ ...card, padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: imcData ? '12px' : '24px' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--color-surface-hover)',
            border: '1px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-headlines)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.nombre || 'Sin nombre'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Tarjeta IMC — visible cuando hay altura y peso */}
        {imcData && (
          <div style={{
            ...card,
            padding: '14px 16px',
            marginBottom: '24px',
            borderLeft: `3px solid ${imcData.color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
                IMC · {imcData.usandoActual ? 'peso actual' : 'peso inicial'}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: imcData.color, lineHeight: 1 }}>
                {imcData.imc}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: imcData.color, fontFamily: 'var(--font-body)' }}>
                {imcData.categoria}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 2 }}>
                {altura} cm · {imcData.peso} {unidad}
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSave}>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>
            Datos personales
          </div>

          <div style={{ ...card, padding: '16px 16px 4px', marginBottom: '16px' }}>
            <Field label="Nombre">
              <input
                type="text"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                style={inputStyle}
              />
            </Field>

            <Field label="Sexo">
              <div style={{ display: 'flex', gap: '8px' }}>
                {[{v:'masculino',l:'Masculino'},{v:'femenino',l:'Femenino'},{v:'otro',l:'Otro'}].map(({v,l}) => (
                  <button
                    key={v} type="button"
                    onClick={() => setSexo(v)}
                    style={{
                      flex: 1, padding: '9px 4px',
                      background: sexo === v ? 'var(--color-accent-white)' : 'var(--color-surface-hover)',
                      color:      sexo === v ? 'var(--color-bg-base)' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-body)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Altura (cm)">
              <input
                type="number" min="100" max="250" step="1"
                value={altura}
                onChange={e => setAltura(e.target.value)}
                placeholder="170"
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </Field>

            <Field label="Consumo basal (kcal/día)">
              <input
                type="number" min="500" max="6000" step="1"
                value={consumoBas}
                onChange={e => setConsumoBas(e.target.value)}
                placeholder="2000"
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </Field>

            <Field label="Hidratación objetivo (ml/día)">
              <input
                type="number" min="500" max="6000" step="50"
                value={hidratObj}
                onChange={e => setHidratObj(e.target.value)}
                placeholder="2000"
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </Field>

            <Field label="Unidad de peso">
              <div style={{ display: 'flex', gap: '8px' }}>
                {['kg', 'lb'].map(u => (
                  <button
                    key={u} type="button"
                    onClick={() => setUnidad(u)}
                    style={{
                      flex: 1, padding: '10px',
                      background: unidad === u ? 'var(--color-accent-white)' : 'var(--color-surface-hover)',
                      color:      unidad === u ? 'var(--color-bg-base)' : 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '4px', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600, fontFamily: 'var(--font-body)',
                    }}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </Field>
          </div>

          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>
            Tratamiento
          </div>

          <div style={{ ...card, padding: '16px 16px 4px', marginBottom: '24px' }}>
            <Field label={`Peso inicial (${unidad})`}>
              <input
                type="number" step="0.1" min="20" max="400"
                value={pesoIni}
                onChange={e => setPesoIni(e.target.value)}
                placeholder="90.0"
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </Field>
            <Field label={`Peso objetivo (${unidad})`}>
              <input
                type="number" step="0.1" min="20" max="400"
                value={pesoObj}
                onChange={e => setPesoObj(e.target.value)}
                placeholder="75.0"
                style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }}
              />
            </Field>
            <Field label="Fecha inicio tratamiento">
              <input
                type="date"
                value={fechaIni}
                onChange={e => setFechaIni(e.target.value)}
                style={inputStyle}
              />
            </Field>
          </div>

          {error && (
            <div style={{
              padding: '10px 12px', marginBottom: '12px',
              background: 'rgba(255,59,48,0.1)',
              border: '1px solid var(--color-accent-red)',
              borderRadius: '4px',
              fontSize: '12px', color: 'var(--color-accent-red)', fontFamily: 'var(--font-body)',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '13px',
              background: saved ? 'var(--color-accent-green)' : 'var(--color-accent-white)',
              color: 'var(--color-bg-base)',
              border: 'none', borderRadius: '4px',
              fontSize: '14px', fontWeight: 700,
              fontFamily: 'var(--font-body)',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              transition: 'background 300ms',
              marginBottom: '32px',
            }}
          >
            {saving ? 'Guardando...' : saved ? '✓ Guardado' : 'Guardar cambios'}
          </button>
        </form>

        {/* Preferencias */}
        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '14px' }}>
          Preferencias
        </div>
        <div style={{ ...card, padding: '0', marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                {isDark ? '🌙 Tema oscuro' : '☀️ Tema claro'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
                {isDark ? 'Interfaz en negro' : 'Interfaz en blanco'}
              </div>
            </div>
            <button
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              style={{
                position: 'relative',
                width: '48px', height: '28px',
                background: isDark ? 'var(--color-border)' : 'var(--color-accent-green)',
                border: 'none', borderRadius: '14px',
                cursor: 'pointer', flexShrink: 0,
                transition: 'background 300ms',
              }}
            >
              <span style={{
                position: 'absolute', top: '3px',
                left: isDark ? '3px' : '23px',
                width: '22px', height: '22px',
                background: '#ffffff', borderRadius: '50%',
                transition: 'left 250ms cubic-bezier(0.16,1,0.3,1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', pointerEvents: 'none',
              }}>
                {isDark ? '🌙' : '☀️'}
              </span>
            </button>
          </div>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleSignOut}
          style={{
            width: '100%', padding: '13px',
            background: 'none',
            color: 'var(--color-accent-red)',
            border: '1px solid rgba(255,59,48,0.3)',
            borderRadius: '4px',
            fontSize: '13px', fontFamily: 'var(--font-body)',
            cursor: 'pointer',
          }}
        >
          Cerrar sesión
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
