/**
 * MounjaroPen — Pen 3D interactivo para selección de dosis Mounjaro.
 * Diseño blanco/negro. Gira el dial para cambiar dosis.
 * Expone triggerInject() vía ref para que el formulario dispare la animación al guardar.
 */
import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

const DOSES = [
  { val: 2.5,  label: 'Dosis inicial',    color: '#5DCAA5' },
  { val: 5,    label: 'Mes 1-2',          color: '#378ADD' },
  { val: 7.5,  label: 'Mes 3-4',          color: '#7F77DD' },
  { val: 10,   label: 'Mes 5-6',          color: '#f5a623' },
  { val: 12.5, label: 'Dosis media-alta', color: '#D85A30' },
  { val: 15,   label: 'Dosis máxima',     color: '#E24B4A' },
];

const INIT_LIQUIDS = [0.85, 0.70, 0.55, 0.40, 0.28, 0.15];

const TICKS = DOSES.map((_, i) => {
  const a   = (i / DOSES.length) * 360 - 90;
  const rad = a * Math.PI / 180;
  return {
    x1: (48 + 33 * Math.cos(rad)).toFixed(2),
    y1: (48 + 33 * Math.sin(rad)).toFixed(2),
    x2: (48 + 42 * Math.cos(rad)).toFixed(2),
    y2: (48 + 42 * Math.sin(rad)).toFixed(2),
  };
});

function makeBubbles() {
  return Array.from({ length: 5 }, (_, i) => ({
    id:       Date.now() + i,
    size:     3 + Math.random() * 5,
    left:     8 + Math.random() * 64,
    bottom:   Math.random() * 50,
    delay:    Math.random() * 1.5,
    duration: 1.5 + Math.random() * 1.2,
  }));
}

function Face({ w, h, bg, tz, ry = 0, br = '0' }) {
  let tf = ry !== 0 ? `rotateY(${ry}deg) ` : '';
  tf += `translateZ(${tz}px)`;
  return (
    <div style={{ position: 'absolute', width: w, height: h, background: bg, borderRadius: br, transform: tf }} />
  );
}

// ─── Componente (forwardRef para exponer triggerInject) ───────────
const MounjaroDial = forwardRef(function MounjaroDial({ value = 2.5, onChange }, ref) {
  const initIdx = Math.max(0, DOSES.findIndex(d => d.val === value));

  const [doseIdx,   setDoseIdx]   = useState(initIdx);
  const [dialAngle, setDialAngle] = useState(0);
  const [capAngle,  setCapAngle]  = useState(0);
  const [liquids,   setLiquids]   = useState([...INIT_LIQUIDS]);
  const [injStatus, setInjStatus] = useState('');
  const [injecting, setInjecting] = useState(false);   // dispara la animación
  const [bubbles,   setBubbles]   = useState(makeBubbles);

  const dragging     = useRef(false);
  const lastAngle    = useRef(0);
  const dialAngleRef = useRef(0);
  const capAngleRef  = useRef(0);
  const currentIdx   = useRef(initIdx);
  const dialSvgRef   = useRef(null);
  const penRef       = useRef(null);

  const dose        = DOSES[doseIdx];
  const liquidLevel = liquids[doseIdx];

  useEffect(() => { setBubbles(makeBubbles()); }, [doseIdx]);

  // ── API pública expuesta al padre via ref ──────────────────────
  useImperativeHandle(ref, () => ({
    triggerInject() {
      const idx = currentIdx.current;

      // 1. Comprimir el pen (simula presionar el émbolo)
      setInjecting(true);
      setTimeout(() => setInjecting(false), 500);

      // 2. Bajar el nivel de líquido
      setLiquids(prev => {
        const next = [...prev];
        next[idx] = Math.max(0, next[idx] - 0.14);
        return next;
      });

      // 3. Nuevas burbujas
      setBubbles(makeBubbles());

      // 4. Mensaje de confirmación
      setInjStatus(`Inyectados ${DOSES[idx].val.toFixed(1)} mg ✓`);
      setTimeout(() => setInjStatus(''), 2600);
    },
  }));

  // ── Drag del dial ─────────────────────────────────────────────
  function getAngle(e) {
    const rect = dialSvgRef.current.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const ex   = e.touches ? e.touches[0].clientX : e.clientX;
    const ey   = e.touches ? e.touches[0].clientY : e.clientY;
    return Math.atan2(ey - cy, ex - cx) * 180 / Math.PI;
  }

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    lastAngle.current = getAngle(e);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    const angle = getAngle(e);
    let delta   = angle - lastAngle.current;
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    lastAngle.current = angle;

    dialAngleRef.current += delta;
    capAngleRef.current  += delta * 0.6;
    setDialAngle(dialAngleRef.current);
    setCapAngle(capAngleRef.current);

    const step = 360 / DOSES.length;
    const norm = ((dialAngleRef.current % 360) + 360) % 360;
    const idx  = Math.round(norm / step) % DOSES.length;
    if (idx !== currentIdx.current) {
      currentIdx.current = idx;
      setDoseIdx(idx);
      onChange(DOSES[idx].val);
    }
  }, [onChange]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '8px 0 4px',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', gap: 24, width: '100%',
      }}>

        {/* ══════════ PEN 3D ══════════ */}
        <div style={{ width: 120, height: 480, perspective: '700px', flexShrink: 0 }}>
          {/* Contenedor del pen — se comprime al inyectar */}
          <div
            ref={penRef}
            style={{
              width: 120, height: 480,
              transformStyle: 'preserve-3d',
              position: 'relative',
              transform: injecting ? 'scaleY(0.965) scaleX(0.97)' : 'scaleY(1) scaleX(1)',
              transition: injecting
                ? 'transform 0.08s ease-in'
                : 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            {/* Tapa — blanca */}
            <div style={{
              position: 'absolute', left: '50%', top: 0,
              transform: `translateX(-50%) rotateY(${capAngle}deg)`,
              width: 72, height: 64, transformStyle: 'preserve-3d',
              transition: 'transform 30ms linear',
            }}>
              <Face w={72} h={64} bg="#f0f0f0" tz={36} br="12px 12px 0 0" />
              <Face w={72} h={64} bg="#cccccc" tz={36} ry={180} br="12px 12px 0 0" />
              <Face w={72} h={64} bg="#dedede" tz={36} ry={-90} br="10px 10px 0 0" />
              <Face w={72} h={64} bg="#dedede" tz={36} ry={90}  br="10px 10px 0 0" />
              <div style={{
                position: 'absolute', width: 72, height: 72,
                background: '#e8e8e8', borderRadius: 12,
                transform: 'rotateX(90deg) translateZ(0px) translateY(-36px)',
              }} />
            </div>

            {/* Cuerpo — negro */}
            <div style={{
              position: 'absolute', left: '50%', top: 64,
              transform: 'translateX(-50%)',
              width: 64, height: 290, transformStyle: 'preserve-3d',
            }}>
              {/* Cara frontal */}
              <div style={{
                position: 'absolute', width: 64, height: 290,
                background: '#1a1a1a', transform: 'translateZ(32px)',
                transition: 'background 0.15s',
              }}>
                {/* Flash blanco al inyectar */}
                {injecting && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: 'inherit',
                    animation: 'penFlash 0.4s ease-out forwards',
                    pointerEvents: 'none',
                  }} />
                )}

                {/* Sticker */}
                <div style={{
                  position: 'absolute', left: 6, top: 16,
                  width: 52, height: 116, background: '#f5f5f5',
                  borderRadius: 4, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '6px 4px', gap: 2,
                }}>
                  <span style={{ fontSize: 6, fontWeight: 600, color: '#666', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>Eli Lilly</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0a0a0a', fontFamily: 'Inter, sans-serif' }}>Mounjaro</span>
                  <div style={{ width: 36, height: 2, background: '#0a0a0a', borderRadius: 2, margin: '3px 0' }} />
                  <span style={{ fontSize: 6, color: '#888', fontStyle: 'italic', fontFamily: 'Inter, sans-serif' }}>tirzepatida</span>
                  <span style={{ fontSize: 7, color: '#555', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>{dose.val.toFixed(1)} mg/0.5 mL</span>
                </div>

                {/* Ventana de líquido */}
                <div style={{
                  position: 'absolute', left: 10, top: 152,
                  width: 44, height: 72,
                  borderRadius: 4,
                  border: '2px solid rgba(255,255,255,0.15)',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.5)',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                    height: `${liquidLevel * 100}%`,
                    background: liquidLevel > 0.3
                      ? 'rgba(120,200,255,0.65)'
                      : 'rgba(120,200,255,0.3)',
                    transition: 'height 0.7s cubic-bezier(.4,0,.2,1)',
                  }}>
                    {bubbles.map(b => (
                      <div key={b.id} style={{
                        position: 'absolute',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.45)',
                        width: b.size, height: b.size,
                        left:   `${b.left}%`,
                        bottom: `${b.bottom}%`,
                        animation: `rise ${b.duration}s ease-in ${b.delay}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>

                {/* Zona del émbolo (visual, no es botón) */}
                <div style={{
                  position: 'absolute', left: 8, top: 244,
                  width: 48, height: 32,
                  background: injecting ? '#333' : '#222',
                  borderRadius: 5,
                  border: '1px solid rgba(255,255,255,0.08)',
                  transition: 'background 0.1s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 28, height: 3,
                    background: injecting ? '#888' : '#444',
                    borderRadius: 2,
                    transition: 'background 0.2s',
                  }} />
                </div>
              </div>

              <Face w={64} h={290} bg="#0a0a0a" tz={32} ry={180} />
              <Face w={64} h={290} bg="#111111" tz={32} ry={-90} />
              <Face w={64} h={290} bg="#111111" tz={32} ry={90}  />
            </div>

            {/* Base inferior */}
            <div style={{
              position: 'absolute', left: '50%', top: 354,
              transform: 'translateX(-50%)',
              width: 64, height: 28, transformStyle: 'preserve-3d',
            }}>
              <Face w={64} h={28} bg="#2a2a2a" tz={32} br="0 0 10px 10px" />
              <Face w={64} h={28} bg="#111111" tz={32} ry={180} br="0 0 10px 10px" />
              <Face w={64} h={28} bg="#1c1c1c" tz={32} ry={-90} br="0 0 8px 8px" />
              <Face w={64} h={28} bg="#1c1c1c" tz={32} ry={90}  br="0 0 8px 8px" />
            </div>

            {/* Aguja */}
            <div style={{
              position: 'absolute', left: '50%', top: 382,
              transform: 'translateX(-50%)',
              width: 14, height: 56, transformStyle: 'preserve-3d',
            }}>
              <div style={{ position: 'absolute', width: 14, height: 56, background: '#d0d0d0', borderRadius: '2px 2px 7px 7px', transform: 'translateZ(7px)' }} />
              <div style={{ position: 'absolute', width: 14, height: 56, background: '#aaa',    borderRadius: '2px 2px 7px 7px', transform: 'rotateY(90deg) translateZ(7px)' }} />
            </div>
          </div>
        </div>

        {/* ══════════ PANEL DIAL ══════════ */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 12,
          flexShrink: 0, paddingTop: 8,
        }}>
          {/* Burbuja de dosis */}
          <div style={{
            position: 'relative',
            background: dose.color,
            borderRadius: 12, padding: '10px 18px',
            textAlign: 'center', minWidth: 96,
            transition: 'background 0.3s ease',
            transform: injecting ? 'scale(1.06)' : 'scale(1)',
          }}>
            <div style={{
              fontSize: 24, fontWeight: 700, color: 'white',
              fontFamily: 'var(--font-mono)', lineHeight: 1,
            }}>
              {dose.val.toFixed(1)}
            </div>
            <div style={{
              fontSize: 10, color: 'rgba(255,255,255,0.8)',
              marginTop: 4, fontFamily: 'var(--font-body)', letterSpacing: '0.04em',
            }}>
              mg · tirzepatida
            </div>
            {/* Flecha */}
            <div style={{
              position: 'absolute', top: '100%', left: '50%',
              transform: 'translateX(-50%)',
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: `7px solid ${dose.color}`,
              transition: 'border-top-color 0.3s ease',
            }} />
          </div>

          <div style={{
            fontSize: 11, color: 'var(--color-text-secondary)',
            textAlign: 'center', fontFamily: 'var(--font-body)', minHeight: 16,
          }}>
            {dose.label}
          </div>

          <div style={{ height: 8 }} />

          <div style={{
            fontSize: 10, color: 'var(--color-text-muted)',
            letterSpacing: '0.06em', fontFamily: 'var(--font-body)',
            textTransform: 'uppercase',
          }}>
            Gira para ajustar
          </div>

          {/* SVG Dial */}
          <svg
            ref={dialSvgRef}
            viewBox="0 0 96 96" width={96} height={96}
            style={{ cursor: 'grab', userSelect: 'none', display: 'block', touchAction: 'none' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <circle cx="48" cy="48" r="44" fill="#1c1c1c" stroke="#3a3a3a" strokeWidth="1"/>
            <circle cx="48" cy="48" r="34" fill="#141414" stroke="#2a2a2a" strokeWidth="1"/>
            <circle cx="48" cy="48" r="22" fill="#0f0f0f"/>
            {TICKS.map((t, i) => (
              <line
                key={i}
                x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                stroke={i === doseIdx ? '#ffffff' : '#3a3a3a'}
                strokeWidth={i === doseIdx ? 2.5 : 1.5}
                strokeLinecap="round"
                style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
              />
            ))}
            <line
              x1="48" y1="48" x2="48" y2="10"
              stroke="white" strokeWidth="2.5" strokeLinecap="round"
              transform={`rotate(${dialAngle}, 48, 48)`}
            />
            <circle cx="48" cy="48" r="5" fill="white"/>
          </svg>

          {/* Estado inyección */}
          <div style={{
            fontSize: 11, minHeight: 16, textAlign: 'center',
            color: injStatus ? 'var(--color-accent-green)' : 'transparent',
            fontFamily: 'var(--font-body)',
            transition: 'color 0.3s',
            fontWeight: injStatus ? 600 : 400,
          }}>
            {injStatus || '\u00A0'}
          </div>
        </div>
      </div>

      <p style={{
        fontSize: 10, color: 'var(--color-text-muted)',
        textAlign: 'center', marginTop: 10,
        maxWidth: 280, lineHeight: 1.6,
        fontFamily: 'var(--font-body)', letterSpacing: '0.02em',
      }}>
        Gira el dial para ajustar la dosis · Pulsa <strong style={{ color: 'var(--color-text-secondary)' }}>Guardar</strong> para registrar
      </p>

      <style>{`
        @keyframes penFlash {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
});

export default MounjaroDial;
