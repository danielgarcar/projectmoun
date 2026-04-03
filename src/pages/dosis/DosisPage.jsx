import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useDosis } from '../../hooks/useDosis.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import DosisForm from './DosisForm.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

const EFECTOS_ICON = {
  'náuseas':        '🤢',
  'fatiga':         '😴',
  'dolor de cabeza':'🤕',
  'estreñimiento':  '😣',
  'otros':          '💬',
};

const CIRC_R    = 44;
const CIRC_FULL = 2 * Math.PI * CIRC_R; // 276.46

function CircularCountdown({ diasPara, proximaDosis, dosisActual_mg }) {
  const urgente = diasPara !== null && diasPara <= 1;
  const pronto  = diasPara !== null && diasPara <= 3 && diasPara > 1;

  const strokeColor = urgente ? 'var(--color-accent-red)'
                    : pronto  ? '#f5a623'
                    : 'var(--color-accent-white)';

  const maxDays  = 7;
  const fraction = diasPara != null ? Math.max(0, Math.min(1, diasPara / maxDays)) : 1;
  const target   = CIRC_FULL * (1 - fraction); // 0 = full ring, CIRC_FULL = empty ring

  // Arranca vacío y anima al valor real con CSS transition
  const [offset, setOffset] = useState(CIRC_FULL);
  useEffect(() => {
    const id = setTimeout(() => setOffset(target), 80);
    return () => clearTimeout(id);
  }, [target]);

  return (
    <div style={{ ...card, padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

        {/* Anillo SVG */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width="110" height="110" viewBox="0 0 120 120" style={{ overflow: 'visible' }}>
            {/* Glow filter */}
            <defs>
              <filter id="ringGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Track */}
            <circle
              cx="60" cy="60" r={CIRC_R}
              fill="none"
              stroke="var(--color-border)"
              strokeWidth="4"
            />

            {/* Progreso */}
            <circle
              cx="60" cy="60" r={CIRC_R}
              fill="none"
              stroke={strokeColor}
              strokeWidth="4"
              strokeDasharray={`${CIRC_FULL} ${CIRC_FULL}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              filter={urgente ? 'url(#ringGlow)' : undefined}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '60px 60px',
                transition: 'stroke-dashoffset 1.3s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s',
              }}
            />

            {/* Número central */}
            <text
              x="60" y="55"
              textAnchor="middle"
              dominantBaseline="middle"
              fill={diasPara != null ? strokeColor : 'var(--color-text-muted)'}
              fontSize="28"
              fontWeight="700"
              fontFamily="'Space Mono', monospace"
              style={{ transition: 'fill 0.3s' }}
            >
              {diasPara != null ? diasPara : '—'}
            </text>

            {/* Subtexto */}
            <text
              x="60" y="76"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--color-text-muted)"
              fontSize="9"
              fontFamily="'Inter', sans-serif"
              letterSpacing="0.08em"
            >
              {diasPara === 0 ? '¡HOY!' : diasPara === 1 ? 'DÍA' : 'DÍAS'}
            </text>
          </svg>
        </div>

        {/* Texto derecho */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '10px', color: 'var(--color-text-muted)',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: 'var(--font-body)', marginBottom: '6px',
          }}>
            Próximo pinchazo
          </div>

          {proximaDosis ? (
            <div style={{
              fontSize: '13px', color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-body)', marginBottom: '12px',
              textTransform: 'capitalize', lineHeight: 1.4,
            }}>
              {proximaDosis.toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </div>
          ) : (
            <div style={{
              fontSize: '12px', color: 'var(--color-text-muted)',
              fontFamily: 'var(--font-body)', marginBottom: '12px',
            }}>
              Sin registros aún
            </div>
          )}

          {dosisActual_mg && (
            <div style={{
              display: 'inline-flex', alignItems: 'baseline', gap: '3px',
              padding: '6px 12px',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: '4px',
            }}>
              <span style={{
                fontSize: '16px', fontWeight: 700,
                fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)',
              }}>
                {dosisActual_mg}
              </span>
              <span style={{
                fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)',
              }}>
                mg
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Banner urgencia */}
      {urgente && diasPara === 0 && (
        <div style={{
          marginTop: '14px',
          padding: '8px 12px',
          background: 'rgba(255,59,48,0.08)',
          border: '1px solid rgba(255,59,48,0.25)',
          borderRadius: '4px',
          fontSize: '11px', fontWeight: 600,
          color: 'var(--color-accent-red)',
          fontFamily: 'var(--font-body)',
          textAlign: 'center',
          letterSpacing: '0.05em',
        }}>
          ¡Hoy toca pinchazo!
        </div>
      )}
    </div>
  );
}

function DosisCard({ entry, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);

  const fecha = new Date(entry.fecha).toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
  const hora = new Date(entry.fecha).toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div style={{ ...card, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {/* Info principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '18px', fontWeight: 700,
              fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)',
            }}>
              {entry.dosis_mg} mg
            </span>
            <span style={{
              fontSize: '10px', fontFamily: 'var(--font-body)',
              color: 'var(--color-text-muted)',
              background: 'var(--color-surface-hover)',
              border: '1px solid var(--color-border)',
              borderRadius: '3px', padding: '2px 6px',
              textTransform: 'capitalize',
            }}>
              {entry.zona}
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: '6px', textTransform: 'capitalize' }}>
            {fecha} · {hora}
          </div>

          {entry.efectos_secundarios?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '6px' }}>
              {entry.efectos_secundarios.map(ef => (
                <span key={ef} style={{
                  fontSize: '10px', fontFamily: 'var(--font-body)',
                  color: 'var(--color-accent-red)',
                  background: 'rgba(255,59,48,0.08)',
                  border: '1px solid rgba(255,59,48,0.2)',
                  borderRadius: '3px', padding: '2px 6px',
                }}>
                  {EFECTOS_ICON[ef] || ''} {ef}
                </span>
              ))}
            </div>
          )}

          {entry.notas && (
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', fontStyle: 'italic' }}>
              {entry.notas}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0, alignItems: 'center' }}>
          <button
            onClick={() => onEdit(entry)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', lineHeight: 1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {confirmDel ? (
            <button
              onClick={() => { onDelete(entry.id); setConfirmDel(false); }}
              style={{ background: 'var(--color-accent-red)', border: 'none', cursor: 'pointer', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600 }}
            >
              ¿Borrar?
            </button>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '4px', lineHeight: 1 }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DosisPage() {
  const { user } = useAuth();
  const {
    dosis, loading,
    dosisActual_mg, proximaDosis, diasParaProximaDosis,
    historialEscalada,
    addDosis, updateDosis, deleteDosis,
  } = useDosis(user?.id);

  const [showForm,   setShowForm]   = useState(false);
  const [editEntry,  setEditEntry]  = useState(null);
  const [showEscala, setShowEscala] = useState(false);

  function handleEdit(entry) { setEditEntry(entry); setShowForm(true); }
  function handleClose()     { setShowForm(false); setEditEntry(null); }
  async function handleSave(data) {
    if (editEntry) await updateDosis(editEntry.id, data);
    else           await addDosis(data);
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Dosis" subtitle="Mounjaro" />

      <main style={{
        flex: 1, overflowY: 'auto',
        padding: '20px var(--page-padding-h)',
        paddingBottom: 'calc(var(--bottom-nav-h) + 80px)',
      }}>

        {/* Countdown ring */}
        <CircularCountdown
          diasPara={diasParaProximaDosis}
          proximaDosis={proximaDosis}
          dosisActual_mg={dosisActual_mg}
        />

        {/* Historial de escalada */}
        {historialEscalada.length > 1 && (
          <section style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowEscala(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: '10px', padding: 0,
              }}
            >
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
                Escalada de dosis
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="2"
                style={{ transform: showEscala ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showEscala && (
              <div style={{ ...card, padding: '12px 16px', display: 'flex', gap: '0', overflowX: 'auto' }}>
                {historialEscalada.map((h, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                        {h.dosis_mg}mg
                      </div>
                      <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                        {new Date(h.fecha_inicio).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    {i < historialEscalada.length - 1 && (
                      <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ margin: '0 4px', flexShrink: 0 }}>
                        <path d="M0 5h14M10 1l4 4-4 4" stroke="#2a2a2a" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Historial */}
        <section>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
            Historial ({dosis.length})
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 72, borderRadius: 4 }} />
              ))}
            </div>
          ) : dosis.length === 0 ? (
            <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
                Sin registros todavía
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                Pulsa + para registrar tu primera dosis
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dosis.map(entry => (
                <DosisCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={deleteDosis}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <FAB label="Nueva dosis" onClick={() => { setEditEntry(null); setShowForm(true); }} />
      <BottomNav />

      {showForm && (
        <DosisForm
          onClose={handleClose}
          onSave={handleSave}
          initialData={editEntry}
        />
      )}
    </div>
  );
}
