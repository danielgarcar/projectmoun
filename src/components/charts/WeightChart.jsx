import { useState } from 'react'
import {
  LineChart,
  Line,
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {RANGES.map(r => (
          <button
            key={r.label}
            onClick={() => setRange(r.label)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              color: range === r.label ? '#ffffff' : '#444444',
              fontSize: 12,
              fontFamily: '"Courier New", monospace',
              borderBottom: range === r.label ? '1px solid #ffffff' : '1px solid transparent',
              transition: 'color 150ms',
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
          <p style={{ color: '#444444', fontSize: 13, fontFamily: 'Inter, sans-serif', textAlign: 'center', margin: 0 }}>
            Registra al menos 2 pesadas para ver la grafica
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 5, bottom: 5, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1c1c1c" />
            <XAxis
              dataKey="fecha"
              tick={{ fill: '#444444', fontSize: 11, fontFamily: '"Courier New", monospace' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#444444', fontSize: 11, fontFamily: '"Courier New", monospace' }}
              axisLine={false}
              tickLine={false}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                background: '#1c1c1c',
                border: '1px solid #2a2a2a',
                borderRadius: 4,
              }}
              labelStyle={{ color: '#888888', fontSize: 11 }}
              itemStyle={{ color: '#f5f5f5', fontSize: 13 }}
              formatter={(v) => [`${v} kg`, 'Peso']}
            />
            <Line
              type="monotone"
              dataKey="peso"
              stroke="#ffffff"
              strokeWidth={2}
              dot={{ fill: '#ffffff', r: 3 }}
              activeDot={{ r: 5, fill: '#ffffff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
