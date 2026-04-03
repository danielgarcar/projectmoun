import { useState } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const RANGES = [
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '6M', days: 180 },
  { label: 'Todo', days: null },
]

function CustomDot({ cx, cy, payload, value }) {
  if (!cx || !cy) return null
  return (
    <circle
      cx={cx} cy={cy} r={3}
      fill="#ffffff"
      strokeWidth={0}
      style={{ filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))' }}
    />
  )
}

export default function WeightChart({ data }) {
  const [range, setRange] = useState('Todo')

  const filtered = data.filter(d => {
    const r = RANGES.find(r => r.label === range)
    if (!r.days) return true
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - r.days)
    return new Date(d.fecha) >= cutoff
  })

  const chartData = filtered.map(d => ({
    fecha: new Date(d.fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    }),
    peso: parseFloat(d.peso),
  }))

  return (
    <div>
      {/* Selector de rango */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r.label)}
            style={{
              background: range === r.label ? 'var(--color-surface-hover)' : 'transparent',
              border: `1px solid ${range === r.label ? 'var(--color-border)' : 'transparent'}`,
              cursor: 'pointer',
              padding: '4px 10px',
              color: range === r.label ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              transition: 'all 150ms',
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {chartData.length < 2 ? (
        <div
          style={{
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <p style={{
            color: 'var(--color-text-muted)',
            fontSize: 12,
            fontFamily: 'var(--font-body)',
            textAlign: 'center',
            margin: 0,
          }}>
            Registra al menos 2 pesadas para ver la gráfica
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 5, bottom: 5, left: -20 }}
          >
            <defs>
              <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#ffffff" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
            <XAxis
              dataKey="fecha"
              tick={{ fill: '#444444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#444444', fontSize: 10, fontFamily: 'var(--font-mono)' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: '#141414',
                border: '1px solid #2a2a2a',
                borderRadius: 4,
                padding: '8px 12px',
              }}
              labelStyle={{ color: '#888888', fontSize: 10, fontFamily: 'var(--font-body)', marginBottom: 2 }}
              itemStyle={{ color: '#f5f5f5', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 700 }}
              formatter={(v) => [`${v} kg`, '']}
              cursor={{ stroke: '#2a2a2a', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="peso"
              stroke="#ffffff"
              strokeWidth={2}
              fill="url(#weightGrad)"
              dot={<CustomDot />}
              activeDot={{ r: 5, fill: '#ffffff', strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
