/**
 * MuscleMap — Wrapper del mapa muscular interactivo.
 * Convierte los grupos en español del app ↔ slugs de react-muscle-highlighter.
 */
import { useState, useEffect } from 'react';
import Body from 'react-muscle-highlighter';

// ── Mapeo ES → slugs de la librería ──────────────────────────────
export const GRUPO_A_SLUGS = {
  'pecho':     ['chest'],
  'espalda':   ['upper-back', 'lower-back', 'trapezius'],
  'piernas':   ['quadriceps', 'hamstring', 'calves'],
  'hombros':   ['deltoids'],
  'biceps':    ['biceps'],
  'triceps':   ['triceps'],
  'core':      ['abs', 'obliques'],
  'cardio':    ['chest', 'quadriceps'],
  'full_body': ['chest', 'biceps', 'triceps', 'deltoids', 'abs', 'obliques', 'quadriceps', 'hamstring', 'gluteal'],
};

// Qué side principal tiene cada grupo
export const GRUPO_SIDE = {
  'pecho': 'front', 'biceps': 'front', 'hombros': 'front',
  'core': 'front', 'cardio': 'front',
  'espalda': 'back', 'triceps': 'back',
  'piernas': 'front', 'full_body': 'front',
};

// ── Reverse: slug → grupo español ────────────────────────────────
const SLUG_A_GRUPO = {
  chest: 'pecho',
  trapezius: 'espalda', 'upper-back': 'espalda', 'lower-back': 'espalda',
  quadriceps: 'piernas', hamstring: 'piernas', calves: 'piernas',
  deltoids: 'hombros',
  biceps: 'biceps',
  triceps: 'triceps',
  abs: 'core', obliques: 'core',
  // gluteal y forearm no tienen grupo en la BD — click ignorado
};

// ── Colores del design system (intensidad 0→3) ────────────────────
const HEAT_COLORS = ['#2a2a2a', '#3a3a3a', '#888888', '#ffffff'];
const SELECT_COLOR = '#ffffff';

/**
 * Props:
 *  mode: 'select'   → interactivo, click para elegir grupo
 *        'heat'     → solo lectura, muestra calor de frecuencia
 *
 *  selectedGroup:   string (modo select) — grupo activo en español
 *  onSelect:        fn(grupo | null) — callback modo select (null = deseleccionar)
 *
 *  heatData:        [{grupo, count}] — modo heat (cuenta de sesiones)
 *
 *  scale:           number (default 0.9)
 *  showToggle:      boolean (muestra botón front/back)
 */
export default function MuscleMap({
  mode = 'select',
  selectedGroup = null,
  onSelect,
  heatData = [],
  scale = 0.9,
  showToggle = true,
}) {
  const [side, setSide] = useState(
    selectedGroup ? (GRUPO_SIDE[selectedGroup] || 'front') : 'front'
  );

  // Sincroniza la vista cuando el grupo cambia desde fuera (ej: cargar datos)
  useEffect(() => {
    if (selectedGroup && GRUPO_SIDE[selectedGroup]) {
      setSide(GRUPO_SIDE[selectedGroup]);
    }
  }, [selectedGroup]);

  // ── Construir datos para la librería ─────────────────────────────
  let bodyData = [];

  if (mode === 'select') {
    // Resalta el grupo seleccionado en blanco
    if (selectedGroup && GRUPO_A_SLUGS[selectedGroup]) {
      bodyData = GRUPO_A_SLUGS[selectedGroup].map(slug => ({
        slug,
        color: SELECT_COLOR,
      }));
    }
  } else {
    // Modo heat: frecuencia de entrenamiento
    const maxCount = Math.max(1, ...heatData.map(d => d.count));
    heatData.forEach(({ grupo, count }) => {
      const slugs = GRUPO_A_SLUGS[grupo] || [];
      const intensity = Math.min(3, Math.ceil((count / maxCount) * 3));
      slugs.forEach(slug => {
        if (!bodyData.find(d => d.slug === slug)) {
          bodyData.push({ slug, intensity });
        }
      });
    });
  }

  // ── Click handler ─────────────────────────────────────────────
  function handlePress(part) {
    if (mode !== 'select' || !onSelect) return;
    const slug = part?.slug ?? part;
    const grupo = SLUG_A_GRUPO[slug];
    if (!grupo) return;

    if (grupo === selectedGroup) {
      // Toggle: deselecciona si ya estaba activo
      onSelect(null);
    } else {
      onSelect(grupo);
      // Auto-switch vista al lado correcto del grupo elegido
      setSide(GRUPO_SIDE[grupo] || 'front');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {/* Toggle front / back */}
      {showToggle && (
        <div style={{
          display: 'flex', gap: 4,
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: 4, padding: 3,
        }}>
          {['front', 'back'].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setSide(s)}
              style={{
                padding: '4px 12px',
                background: side === s ? '#ffffff' : 'transparent',
                color: side === s ? '#0a0a0a' : '#555555',
                border: 'none', borderRadius: 3,
                fontSize: 10, fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {s === 'front' ? 'Frontal' : 'Posterior'}
            </button>
          ))}
        </div>
      )}

      {/* Mapa muscular */}
      <div style={{ lineHeight: 0 }}>
        <Body
          data={bodyData}
          gender="male"
          side={side}
          scale={scale}
          colors={HEAT_COLORS}
          defaultFill="#1c1c1c"
          border="#2a2a2a"
          onBodyPartPress={handlePress}
        />
      </div>

      {/* Label del grupo activo — solo en modo select */}
      {mode === 'select' && (
        <div style={{
          minHeight: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          {selectedGroup ? (
            <>
              <span style={{
                fontSize: 10, fontFamily: 'Inter, sans-serif',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                color: '#f5f5f5', fontWeight: 600,
              }}>
                {selectedGroup}
              </span>
              <button
                type="button"
                onClick={() => onSelect && onSelect(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#555555', padding: 0, lineHeight: 1, fontSize: 10,
                }}
                aria-label="Limpiar grupo muscular"
              >
                ✕
              </button>
            </>
          ) : (
            <span style={{
              fontSize: 10, fontFamily: 'Inter, sans-serif', color: '#444444',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Toca un músculo para seleccionar
            </span>
          )}
        </div>
      )}
    </div>
  );
}
