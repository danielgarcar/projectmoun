import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useProfile } from '../../hooks/useProfile.js';
import { usePesos } from '../../hooks/usePesos.js';
import { useDosis } from '../../hooks/useDosis.js';
import { useComidas } from '../../hooks/useComidas.js';
import { useSesiones } from '../../hooks/useSesiones.js';
import PageHeader from '../../components/layout/PageHeader.jsx';
import BottomNav from '../../components/layout/BottomNav.jsx';
import FAB from '../../components/layout/FAB.jsx';
import WeightChart from '../../components/charts/WeightChart.jsx';

const card = {
  background: 'var(--color-surface-card)',
  border: '1px solid var(--color-border)',
  borderRadius: '4px',
};

function SectionTitle({ children }) {
  return (
    <h2 style={{
      fontSize: '10px', fontWeight: 600,
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.1em',
      marginBottom: '10px', fontFamily: 'var(--font-body)',
    }}>
      {children}
    </h2>
  );
}

function StatCard({ label, value, unit, accent, sub }) {
  return (
    <div style={{ ...card, padding: '14px', borderLeft: `2px solid ${accent || 'var(--color-border)'}` }}>
      <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        <span style={{ fontSize: '26px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>{unit}</span>
        )}
      </div>
      {sub && (
        <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>{sub}</div>
      )}
    </div>
  );
}

function saludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 20) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);
  const { pesos, pesoActual, diferencia } = usePesos(user?.id);
  const { dosisActual_mg, proximaDosis, diasParaProximaDosis } = useDosis(user?.id);
  const { caloriasHoy } = useComidas(user?.id);
  const { sesionesEsemana } = useSesiones(user?.id);

  const unidad   = profile?.unidad_peso || 'kg';
  const nombre   = profile?.nombre || user?.email?.split('@')[0] || '';
  const objetivo = profile?.peso_objetivo_kg;
  const difNum   = diferencia != null ? parseFloat(diferencia) : null;
  const difColor = difNum == null         ? 'var(--color-border)'
                 : difNum < 0             ? 'var(--color-accent-green)'
                 : difNum > 0             ? 'var(--color-accent-red)'
                 : 'var(--color-border)';

  const progreso = pesoActual && objetivo && profile?.peso_inicial_kg
    ? Math.min(100, Math.round(
        (Math.abs(parseFloat(profile.peso_inicial_kg) - parseFloat(pesoActual)) /
         Math.abs(parseFloat(profile.peso_inicial_kg) - parseFloat(objetivo))) * 100
      ))
    : null;

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  const avatarSlot = (
    <button
      onClick={() => navigate('/perfil')}
      style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'var(--color-surface-card)',
        border: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', color: 'var(--color-text-secondary)',
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    </button>
  );

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--color-bg-base)', display: 'flex', flexDirection: 'column' }}>
      <PageHeader title="MounjaroTracker" rightSlot={avatarSlot} />

      <main style={{
        flex: 1, overflowY: 'auto',
        padding: '20px var(--page-padding-h)',
        paddingBottom: 'calc(var(--bottom-nav-h) + 80px)',
      }}>
        {/* Saludo */}
        <div style={{ marginBottom: '28px' }}>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
            {fechaHoy}
          </p>
          <h1 style={{
            fontSize: '24px', fontWeight: 700,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-headlines)',
            letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            {saludo()}{nombre ? `, ${nombre.split(' ')[0]}` : ''}
          </h1>
        </div>

        {/* Stats 2×2 */}
        <section style={{ marginBottom: '24px' }}>
          <SectionTitle>Resumen</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <StatCard
              label="Peso actual"
              value={pesoActual ?? '—'}
              unit={unidad}
              accent="var(--color-accent-white)"
            />
            <StatCard
              label="Objetivo"
              value={objetivo ?? '—'}
              unit={unidad}
            />
            <StatCard
              label="Diferencia"
              value={difNum != null ? (difNum > 0 ? `+${diferencia}` : diferencia) : '—'}
              unit={unidad}
              accent={difColor}
              sub={progreso != null ? `${progreso}% del objetivo` : undefined}
            />
            <StatCard
              label="Sesiones"
              value={sesionesEsemana ?? 0}
              unit="esta semana"
            />
          </div>
        </section>

        {/* Próxima dosis */}
        <section style={{ marginBottom: '24px' }}>
          <SectionTitle>Dosis Mounjaro</SectionTitle>
          <div
            style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => navigate('/dosis')}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)', marginBottom: '4px' }}>
                Próximo pinchazo
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)', lineHeight: 1 }}>
                {diasParaProximaDosis != null ? `${diasParaProximaDosis}d` : '—'}
              </div>
              {proximaDosis && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px', fontFamily: 'var(--font-body)' }}>
                  {proximaDosis.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </div>
              )}
            </div>
            {dosisActual_mg ? (
              <div style={{
                padding: '8px 16px',
                background: 'var(--color-surface-hover)',
                border: '1px solid var(--color-border)',
                borderRadius: '4px',
                fontSize: '18px', fontWeight: 700,
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-mono)',
              }}>
                {dosisActual_mg} mg
              </div>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}>
                Sin registro
              </span>
            )}
          </div>
        </section>

        {/* Gráfica de peso */}
        {pesos.length > 1 && (
          <section style={{ marginBottom: '24px' }}>
            <SectionTitle>Evolución del peso</SectionTitle>
            <div style={{ ...card, padding: '16px' }}>
              <WeightChart data={pesos} />
            </div>
          </section>
        )}

        {/* Calorías hoy */}
        <section style={{ marginBottom: '8px' }}>
          <SectionTitle>Hoy</SectionTitle>
          <div
            style={{ ...card, padding: '16px', cursor: 'pointer' }}
            onClick={() => navigate('/alimentacion')}
          >
            <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px', fontFamily: 'var(--font-body)' }}>
              Calorías consumidas
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{
                fontSize: '32px', fontWeight: 700, fontFamily: 'var(--font-mono)', lineHeight: 1,
                color: caloriasHoy > 0 ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              }}>
                {caloriasHoy > 0 ? caloriasHoy.toLocaleString('es-ES') : '—'}
              </span>
              {caloriasHoy > 0 && (
                <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-body)' }}>kcal</span>
              )}
            </div>
          </div>
        </section>
      </main>

      <FAB label="Registrar peso" onClick={() => navigate('/peso')} />
      <BottomNav />
    </div>
  );
}
