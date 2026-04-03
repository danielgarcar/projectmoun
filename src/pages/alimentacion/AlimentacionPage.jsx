import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from '../../hooks/useAuth.js';
import { useComidas } from '../../hooks/useComidas.js';
import { useStagger } from '../../hooks/useStagger.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import ComidaForm from './ComidaForm.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

const TIPO_LABEL = { desayuno: '🌅', almuerzo: '☀️', cena: '🌙', snack: '🍎' };
const HAMBRE_LABEL = ['', '😌', '🙂', '😐', '😋', '😤'];

function ComidaCard({ entry, onEdit, onDelete }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const hora = new Date(entry.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ ...card, padding: '12px 14px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, flexShrink: 0, lineHeight: 1, paddingTop: 1 }}>
          {TIPO_LABEL[entry.tipo] || '🍽️'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'capitalize', fontFamily: 'var(--font-body)' }}>
              {entry.tipo} · {hora}
            </span>
            {entry.calorias && (
              <span style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', flexShrink: 0 }}>
                {entry.calorias} kcal
              </span>
            )}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>
            {entry.descripcion}
          </div>
          {(entry.hambre_antes || entry.saciedad_despues) && (
            <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', display: 'flex', gap: 10 }}>
              {entry.hambre_antes && <span>Hambre: {HAMBRE_LABEL[entry.hambre_antes]} {entry.hambre_antes}/5</span>}
              {entry.saciedad_despues && <span>Saciedad: {entry.saciedad_despues}/5</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={() => onEdit(entry)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', padding: '3px', lineHeight: 1 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {confirmDel ? (
            <button onClick={() => { onDelete(entry.id); setConfirmDel(false); }}
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
    </div>
  );
}

export default function AlimentacionPage() {
  const { user } = useAuth();
  const { comidas, loading, comidasHoy, caloriasHoy, caloriasSemanales, comidasPorFecha, addComida, updateComida, deleteComida } = useComidas(user?.id);

  const [showForm,  setShowForm]  = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  function handleEdit(entry)  { setEditEntry(entry); setShowForm(true); }
  function handleClose()      { setShowForm(false); setEditEntry(null); }
  async function handleSave(data) {
    if (editEntry) await updateComida(editEntry.id, data);
    else           await addComida(data);
  }

  const dias = Object.keys(comidasPorFecha).sort((a, b) => b.localeCompare(a));
  const listRef = useStagger([comidas.length]);

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="Alimentación" subtitle={caloriasHoy > 0 ? `${caloriasHoy} kcal hoy` : undefined} />

      <main style={{ flex: 1, overflowY: 'auto', padding: '20px var(--page-padding-h)', paddingBottom: 'calc(var(--bottom-nav-h) + 80px)' }}>

        {/* Resumen hoy */}
        <div style={{ ...card, padding: '16px 20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Hoy</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: '36px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: caloriasHoy > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)', lineHeight: 1 }}>
                {caloriasHoy > 0 ? caloriasHoy.toLocaleString('es-ES') : '—'}
              </span>
              {caloriasHoy > 0 && <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>kcal</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Comidas</div>
            <div style={{ fontSize: '28px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)', lineHeight: 1 }}>
              {comidasHoy.length}
            </div>
          </div>
        </div>

        {/* Gráfica semanal */}
        {caloriasSemanales.some(d => d.calorias > 0) && (
          <section style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>Calorías — últimos 7 días</div>
            <div style={{ ...card, padding: '16px' }}>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={caloriasSemanales.map(d => ({ ...d, dia: new Date(d.fecha + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short' }) }))} margin={{ top: 5, right: 5, bottom: 0, left: -24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
                  <XAxis dataKey="dia" tick={{ fill: '#444', fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1c1c1c', border: '1px solid #2a2a2a', borderRadius: 4 }}
                    labelStyle={{ color: '#888', fontSize: 11 }}
                    itemStyle={{ color: '#f5f5f5', fontSize: 12 }}
                    formatter={v => [`${v} kcal`, '']}
                  />
                  <Bar dataKey="calorias" fill="#ffffff" radius={[2, 2, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Historial por fecha */}
        <section>
          <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-body)', marginBottom: '10px' }}>
            Historial ({comidas.length})
          </div>
          {loading ? (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)', textAlign: 'center', padding: '40px 0' }}>Cargando...</p>
          ) : dias.length === 0 ? (
            <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>Sin registros. Pulsa + para añadir.</p>
            </div>
          ) : (
            <div ref={listRef}>
            {dias.map(dia => {
              const totalDia = comidasPorFecha[dia].reduce((s, c) => s + (c.calorias || 0), 0);
              const fechaFmt = new Date(dia + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
              return (
                <div key={dia} style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{fechaFmt}</span>
                    {totalDia > 0 && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{totalDia} kcal</span>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {comidasPorFecha[dia].map(entry => (
                      <ComidaCard key={entry.id} entry={entry} onEdit={handleEdit} onDelete={deleteComida} />
                    ))}
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </section>
      </main>

      <FAB label="Nueva comida" onClick={() => { setEditEntry(null); setShowForm(true); }} />
      <BottomNav />
      {showForm && <ComidaForm onClose={handleClose} onSave={handleSave} initialData={editEntry} />}
    </div>
  );
}
