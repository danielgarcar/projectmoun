import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useDiario } from '../../hooks/useDiario.js';
import { useStagger } from '../../hooks/useStagger.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import DiarioForm from './DiarioForm.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

const ETIQUETA_COLOR = {
  bienestar: '#30d158', logro: '#30d158', motivación: '#30d158',
  dificultad: '#ff3b30', emociones: '#f5a623',
  alimentación: '#888', entrenamiento: '#888', dosis: '#888',
};

function EntradaCard({ entrada, onEdit, onDelete }) {
  const [expanded,   setExpanded]   = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const fecha = new Date(entrada.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
  const preview = entrada.contenido?.slice(0, 100);
  const hayMas  = entrada.contenido?.length > 100;

  return (
    <div style={{ ...card, padding: '16px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize', marginBottom: 2 }}>{fecha}</div>
          {entrada.valoracion && (
            <div style={{ fontSize: 12 }}>{'⭐'.repeat(entrada.valoracion)}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(entrada)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '3px', lineHeight: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {confirmDel ? (
            <button onClick={() => { onDelete(entrada.id); setConfirmDel(false); }}
              style={{ background: 'var(--color-accent-red)', border: 'none', cursor: 'pointer', color: '#fff', padding: '3px 7px', borderRadius: '3px', fontSize: '10px', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
              ¿Borrar?
            </button>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '3px', lineHeight: 1 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Texto */}
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
        {expanded ? entrada.contenido : preview}
        {hayMas && !expanded && '...'}
      </p>
      {hayMas && (
        <button onClick={() => setExpanded(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: 11, fontFamily: 'var(--font-body)', padding: '6px 0 0', textDecoration: 'underline' }}>
          {expanded ? 'Ver menos' : 'Ver más'}
        </button>
      )}

      {/* Etiquetas */}
      {entrada.etiquetas?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {entrada.etiquetas.map(et => (
            <span key={et} style={{
              fontSize: 10, fontFamily: 'var(--font-body)', padding: '3px 7px',
              border: `1px solid ${ETIQUETA_COLOR[et] || 'var(--color-border)'}22`,
              color: ETIQUETA_COLOR[et] || 'var(--color-text-muted)',
              background: `${ETIQUETA_COLOR[et] || '#888'}11`,
              borderRadius: 3,
            }}>{et}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DiarioPage() {
  const { user } = useAuth();
  const { entradas, loading, entradaHoy, valoracionMedia, addEntrada, updateEntrada, deleteEntrada, buscarPorTexto } = useDiario(user?.id);

  const [showForm,   setShowForm]   = useState(false);
  const [editEntry,  setEditEntry]  = useState(null);
  const [busqueda,   setBusqueda]   = useState('');

  function handleEdit(entrada) { setEditEntry(entrada); setShowForm(true); }
  function handleClose()       { setShowForm(false); setEditEntry(null); }
  async function handleSave(data) {
    if (editEntry) await updateEntrada(editEntry.id, data);
    else           await addEntrada(data);
  }

  const resultados = buscarPorTexto(busqueda);
  const listRef = useStagger([resultados.length]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Diario" />

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px var(--page-padding-h)', paddingBottom: 'calc(var(--bottom-nav-h) + 80px)' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
          <div style={{ ...card, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Entradas</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', lineHeight: 1 }}>{entradas.length}</div>
          </div>
          <div style={{ ...card, padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Val. media</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: valoracionMedia ? 'var(--color-text-primary)' : 'var(--color-text-muted)', lineHeight: 1 }}>
              {valoracionMedia ?? '—'}
            </div>
          </div>
        </div>

        {/* Hoy: acceso rápido */}
        {!entradaHoy && (
          <div
            onClick={() => { setEditEntry(null); setShowForm(true); }}
            style={{ ...card, padding: '14px 16px', marginBottom: '20px', cursor: 'pointer', borderStyle: 'dashed', display: 'flex', alignItems: 'center', gap: 10 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.8">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span style={{ fontSize: 13, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Añadir entrada de hoy</span>
          </div>
        )}

        {/* Buscador */}
        {entradas.length > 2 && (
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text" placeholder="Buscar en el diario..."
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              style={{
                width: '100%', background: 'var(--color-surface-card)',
                border: '1px solid var(--color-border)', borderRadius: 4,
                padding: '10px 12px', color: 'var(--color-text-primary)',
                fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        {/* Lista */}
        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
          {busqueda ? `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''}` : `Historial (${entradas.length})`}
        </div>

        {loading ? (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '40px 0' }}>Cargando...</p>
        ) : resultados.length === 0 ? (
          <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
              {busqueda ? 'Sin resultados para esa búsqueda' : 'Sin entradas. Pulsa + para escribir.'}
            </p>
          </div>
        ) : (
          <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {resultados.map(e => (
              <EntradaCard key={e.id} entrada={e} onEdit={handleEdit} onDelete={deleteEntrada} />
            ))}
          </div>
        )}
      </main>

      <FAB label="Nueva entrada" onClick={() => { setEditEntry(null); setShowForm(true); }} />
      <BottomNav />
      {showForm && <DiarioForm onClose={handleClose} onSave={handleSave} initialData={editEntry} />}
    </div>
  );
}
