import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useSesiones } from '../../hooks/useSesiones.js';
import { useStagger } from '../../hooks/useStagger.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import SesionForm from './SesionForm.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

const TIPO_ICON = { fuerza: '🏋️', cardio: '🏃', flexibilidad: '🧘', caminata: '🚶', mixto: '⚡', otro: '💪' };

function SensacionBar({ valor, max = 10, color = 'var(--color-accent-white)' }) {
  if (!valor) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ flex: 1, height: 3, background: 'var(--color-border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${(valor / max) * 100}%`, height: '100%', background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', flexShrink: 0 }}>{valor}/{max}</span>
    </div>
  );
}

function SesionCard({ sesion, onDelete }) {
  const [open, setOpen]          = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const ejercicios = sesion.proymoun_ejercicios || [];
  const totalSeries = ejercicios.reduce((t, e) => t + (e.proymoun_series?.length || 0), 0);

  const fechaFmt = new Date(sesion.fecha_inicio).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
  const horaFmt = new Date(sesion.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ ...card, overflow: 'hidden', marginBottom: '6px' }}>
      {/* Cabecera */}
      <div
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        onClick={() => setOpen(v => !v)}
      >
        <span style={{ fontSize: 22, flexShrink: 0 }}>{TIPO_ICON[sesion.tipo] || '💪'}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-headlines)', textTransform: 'capitalize' }}>{sesion.tipo}</span>
            {sesion.duracion_min && (
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{sesion.duracion_min}min</span>
            )}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>
            {fechaFmt} · {horaFmt}
            {ejercicios.length > 0 && ` · ${ejercicios.length} ejerc. · ${totalSeries} series`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {confirmDel ? (
            <button onClick={e => { e.stopPropagation(); onDelete(sesion.id); setConfirmDel(false); }}
              style={{ background: 'var(--color-accent-red)', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              ¿Borrar?
            </button>
          ) : (
            <button onClick={e => { e.stopPropagation(); setConfirmDel(true); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', lineHeight: 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          )}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Detalle expandido */}
      {open && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '12px 16px' }}>
          {/* Métricas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            {sesion.energia_antes != null && (
              <div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Energía antes</div>
                <SensacionBar valor={sesion.energia_antes} />
              </div>
            )}
            {sesion.sensacion_general != null && (
              <div>
                <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Sensación post</div>
                <SensacionBar valor={sesion.sensacion_general} color="var(--color-accent-green)" />
              </div>
            )}
          </div>
          {sesion.notas && (
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic', marginBottom: 12 }}>{sesion.notas}</div>
          )}
          {/* Ejercicios */}
          {ejercicios.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ejercicios.map((ej, ei) => (
                <div key={ej.id || ei} style={{ background: 'var(--color-surface-hover)', borderRadius: 4, padding: '10px 12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', marginBottom: 6 }}>
                    {ej.nombre}
                    {ej.grupo_muscular && <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontWeight: 400, marginLeft: 6 }}>{ej.grupo_muscular}</span>}
                  </div>
                  {(ej.proymoun_series || []).length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {(ej.proymoun_series || []).map((s, si) => (
                        <div key={s.id || si} style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                          <span style={{ color: 'var(--color-text-muted)', width: 14 }}>{si + 1}.</span>
                          <span>{s.reps ?? '—'} reps</span>
                          <span>{s.peso ?? '—'} kg</span>
                          {s.sensacion && <span style={{ textTransform: 'capitalize', fontFamily: 'Inter, sans-serif', fontSize: 10 }}>{s.sensacion}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EntrenoPage() {
  const { user } = useAuth();
  const { sesiones, loading, sesionesEsemana, volumenTotal, addSesion, addEjercicio, addSerie, deleteSesion } = useSesiones(user?.id);
  const [showForm, setShowForm] = useState(false);
  const listRef = useStagger([sesiones.length]);

  // Nombres únicos de ejercicios del historial para autocompletado
  const historialNombres = [...new Set(
    sesiones.flatMap(s => (s.proymoun_ejercicios || []).map(e => e.nombre).filter(Boolean))
  )].sort((a, b) => a.localeCompare(b, 'es'));

  async function handleSave({ sesion, ejercicios }) {
    const nuevaSesion = await addSesion(sesion);
    for (let i = 0; i < ejercicios.length; i++) {
      const ej = ejercicios[i];
      if (!ej.nombre?.trim()) continue;
      const nuevoEj = await addEjercicio(nuevaSesion.id, {
        nombre:          ej.nombre.trim(),
        grupo_muscular:  ej.grupo_muscular || null,
        orden:           i + 1,
      });
      for (let j = 0; j < ej.series.length; j++) {
        const s = ej.series[j];
        if (!s.reps && !s.peso) continue;
        await addSerie(nuevaSesion.id, nuevoEj.id, {
          numero_serie: j + 1,
          reps:         s.reps ? parseInt(s.reps, 10) : null,
          peso:         s.peso ? parseFloat(s.peso) : null,
          sensacion:    s.sensacion || null,
        });
      }
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Entreno" subtitle={`${sesionesEsemana} sesión${sesionesEsemana !== 1 ? 'es' : ''} esta semana`} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px var(--page-padding-h)', paddingBottom: 'calc(var(--bottom-nav-h) + 80px)' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          {[{ label: 'Esta semana', value: sesionesEsemana, unit: 'sesiones' },
            { label: 'Volumen total', value: volumenTotal > 0 ? Math.round(volumenTotal).toLocaleString('es-ES') : '—', unit: volumenTotal > 0 ? 'kg·rep' : '' },
          ].map(({ label, value, unit }) => (
            <div key={label} style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: 3 }}>{unit}</div>
            </div>
          ))}
        </div>

        {/* Historial */}
        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
          Historial ({sesiones.length})
        </div>
        {loading ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '40px 0' }}>Cargando...</p>
        ) : sesiones.length === 0 ? (
          <div style={{ background: 'var(--color-surface-card)', border: '1px solid var(--color-border)', borderRadius: 4, padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Sin sesiones. Pulsa + para registrar.</p>
          </div>
        ) : (
          <div ref={listRef}>
            {sesiones.map(s => <SesionCard key={s.id} sesion={s} onDelete={deleteSesion} />)}
          </div>
        )}
      </main>

      <FAB label="Nueva sesión" onClick={() => setShowForm(true)} />
      <BottomNav />
      {showForm && <SesionForm onClose={() => setShowForm(false)} onSave={handleSave} historialNombres={historialNombres} />}
    </div>
  );
}
