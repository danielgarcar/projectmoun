import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { usePesos } from '../../hooks/usePesos.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import WeightChart from '../../components/charts/WeightChart.jsx';
import PesoForm from './PesoForm.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

function StatStrip({ pesoActual, pesoInicial, diferencia, objetivo, unidad }) {
  const difNum   = diferencia != null ? parseFloat(diferencia) : null;
  const difColor = difNum == null ? 'var(--color-text-muted)'
                 : difNum < 0    ? 'var(--color-accent-green)'
                 : difNum > 0    ? 'var(--color-accent-red)'
                 : 'var(--color-text-muted)';
  const progreso = pesoActual && objetivo && pesoInicial
    ? Math.min(100, Math.max(0, Math.round(
        (Math.abs(parseFloat(pesoInicial) - parseFloat(pesoActual)) /
         Math.abs(parseFloat(pesoInicial) - parseFloat(objetivo))) * 100
      )))
    : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
      {[
        { label: 'Actual', value: pesoActual ?? '—', unit: unidad, color: 'var(--color-accent-white)' },
        {
          label: 'Diferencia',
          value: difNum != null ? (difNum > 0 ? `+${diferencia}` : diferencia) : '—',
          unit: difNum != null ? unidad : '',
          color: difColor,
        },
        {
          label: 'Progreso',
          value: progreso != null ? `${progreso}%` : '—',
          unit: progreso != null ? 'objetivo' : '',
          color: 'var(--color-text-secondary)',
        },
      ].map(({ label, value, unit, color }) => (
        <div key={label} style={{ ...card, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-mono)', color, lineHeight: 1 }}>
            {value}
          </div>
          {unit && (
            <div style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginTop: '2px' }}>
              {unit}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function RegistroCard({ entry, unidad, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const fecha = new Date(entry.fecha + 'T12:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      {/* Miniatura de foto si existe */}
      {entry.foto_url && (
        <img
          src={entry.foto_url} alt="Foto corporal"
          style={{ width: '100%', maxHeight: 160, objectFit: 'cover', display: 'block' }}
        />
      )}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Fecha */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', textTransform: 'capitalize', marginBottom: '2px' }}>
          {fecha}
        </div>
        {entry.nota && (
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {entry.nota}
          </div>
        )}
      </div>

      {/* Peso */}
      <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', flexShrink: 0 }}>
        {parseFloat(entry.peso).toFixed(1)}
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginLeft: '3px', fontWeight: 400 }}>
          {unidad}
        </span>
      </div>

      {/* Acciones */}
      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
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
      </div> {/* fin padding row */}
    </div>
  );
}

export default function PesoPage() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { pesos, loading, addPeso, updatePeso, deletePeso, pesoActual, pesoInicial, diferencia } = usePesos(user?.id);

  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const unidad   = profile?.unidad_peso || 'kg';
  const objetivo = profile?.peso_objetivo_kg;

  // Orden desc para la lista
  const pesosDesc = [...pesos].reverse();

  function handleEdit(entry) {
    setEditEntry(entry);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setEditEntry(null);
  }

  async function handleSave(data) {
    if (editEntry) {
      await updatePeso(editEntry.id, data);
    } else {
      await addPeso(data);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Peso" subtitle={pesoActual ? `${parseFloat(pesoActual).toFixed(1)} ${unidad} hoy` : 'Sin registros'} />

      <main style={{
        flex: 1, overflowY: 'auto',
        padding: '20px var(--page-padding-h)',
        paddingBottom: 'calc(var(--bottom-nav-h) + 80px)',
      }}>

        {/* Strip de stats */}
        <StatStrip
          pesoActual={pesoActual}
          pesoInicial={pesoInicial}
          diferencia={diferencia}
          objetivo={objetivo}
          unidad={unidad}
        />

        {/* Gráfica */}
        {pesos.length > 1 && (
          <section style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
              Evolución
            </div>
            <div style={{ ...card, padding: '16px' }}>
              <WeightChart data={pesos} />
            </div>
          </section>
        )}

        {/* Lista de registros */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
              Historial ({pesos.length})
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>Cargando...</p>
            </div>
          ) : pesosDesc.length === 0 ? (
            <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
                Sin registros todavía
              </p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                Pulsa + para añadir tu primer peso
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {pesosDesc.map(entry => (
                <RegistroCard
                  key={entry.id}
                  entry={entry}
                  unidad={unidad}
                  onEdit={handleEdit}
                  onDelete={deletePeso}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <FAB label="Registrar peso" onClick={() => { setEditEntry(null); setShowForm(true); }} />
      <BottomNav />

      {showForm && (
        <PesoForm
          onClose={handleClose}
          onSave={handleSave}
          initialData={editEntry}
          userId={user?.id}
        />
      )}
    </div>
  );
}
