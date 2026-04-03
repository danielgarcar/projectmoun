# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Proyecto

**MounjaroTracker** — Web app SaaS (PWA) para seguimiento de peso, dosis de Mounjaro, alimentación, entrenamiento y diario personal. React puro, mobile-first, optimizada para Android.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + React Router v6 |
| Estilos | Tailwind CSS + shadcn/ui |
| Gráficas | Recharts |
| Animaciones | Framer Motion |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Despliegue | Vercel (PWA) |

---

## Comandos

```bash
npm run dev          # Dev server (Vite)
npm run build        # Build producción
npm run preview      # Preview del build
npm run lint         # ESLint
```

---

## Supabase

- **Proyecto:** `mounjaro-tracker`
- **ID:** `zxyruhptcgnvbpkqbfvs`
- **URL:** `https://zxyruhptcgnvbpkqbfvs.supabase.co`
- **Anon key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4eXJ1aHB0Y2dudmJwa3FiZnZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNzE1NTQsImV4cCI6MjA5MDc0NzU1NH0.o7l5hNvwXKmJZOl9gvz7TuysfFTht7aYItGWwqRS4_g`
- **Organización:** `BODADANA` (`fpklkmnaxzcjssxyilpz`)
- **Región:** `eu-west-3` (París)

### Tablas (prefijo `proymoun_`)

```
proymoun_profiles     → perfil del usuario (1:1 con auth.users)
proymoun_dosis        → aplicaciones de Mounjaro
proymoun_pesos        → registros de peso corporal
proymoun_comidas      → registro de alimentación
proymoun_sesiones     → cabecera de sesión de entrenamiento
proymoun_ejercicios   → ejercicios dentro de una sesión
proymoun_series       → series de cada ejercicio (reps, peso, RIR)
proymoun_diario       → entradas del diario personal
```

- RLS activado en todas las tablas. Cada usuario solo ve sus datos.
- `proymoun_ejercicios` y `proymoun_series` no tienen `user_id` directo — se validan por join con `proymoun_sesiones`.
- Trigger `on_auth_user_created` crea automáticamente el perfil al registrarse.
- Buckets Storage: `proymoun-avatars`, `proymoun-fotos-peso`, `proymoun-fotos-comida` (todos privados).

---

## Arquitectura del frontend

```
src/
  lib/
    supabase.js          # cliente Supabase (singleton)
  hooks/                 # custom hooks por módulo (usePesos, useDosis, etc.)
  pages/                 # una carpeta por módulo
    dashboard/
    peso/
    dosis/
    alimentacion/
    entrenamiento/
    diario/
  components/
    ui/                  # componentes base (shadcn/ui)
    charts/              # wrappers de Recharts
    layout/              # BottomNav, FAB, PageHeader
  App.jsx                # router principal
  main.jsx
```

---

## Design System

**Estilo:** Nothing Technology — minimalismo extremo, blanco/negro, tipografía como protagonista.

- **Fondo:** `#0a0a0a` (near-black)
- **Surface cards:** `#141414` / `#1c1c1c`
- **Bordes:** `1px solid #2a2a2a`
- **Texto primario:** `#f5f5f5`
- **Texto secundario:** `#888888`
- **Accent blanco:** `#ffffff` — CTAs y estados activos
- **Accent rojo:** `#ff3b30` — solo para efectos secundarios/alertas
- **Accent verde:** `#30d158` — solo para logros/objetivos alcanzados

**Tipografía:**
- Headlines: `Space Grotesk` (bold, tracking negativo)
- Body: `Inter`
- Números/datos: `Geist Mono` (pesos, repeticiones, calorías)

**Reglas:**
- Sin gradientes. Sin sombras. Sin iconos decorativos.
- Profundidad solo por cambio de color de fondo.
- `border-radius: 4px` en tarjetas (no pills).
- Espaciado en múltiplos de 4px. Padding horizontal de página: 20px.

**Animaciones (Framer Motion):**
- Entrada: slide-up 12px + fade, 300ms ease-out
- Tap en cards: `scale(0.97)`, 150ms
- Contadores numéricos: de 0 al valor en 1s
- Gráficas: dibujan de izquierda a derecha en 800ms
- Transiciones de página: slide horizontal 350ms

---

## Navegación

Bottom navigation bar fija con 6 tabs:
`Dashboard · Peso · Dosis · Alimentación · Entreno · Diario`

FAB "+" flotante en esquina inferior derecha para acceso rápido de registro.

---

## MCP de Playwright (testing visual)

Para que Claude Code pueda navegar y testear la app visualmente, añadir en `C:\Users\Daniel\.claude\settings.json`:

```json
"mcpServers": {
  "playwright": {
    "command": "npx",
    "args": ["@playwright/mcp@latest"]
  }
}
```

Instalar el browser antes de usarlo:
```bash
npx playwright install chromium
```

La app corre en `http://localhost:5173` en desarrollo. Arrancar con `npm run dev` antes de usar el MCP.

---

## Documentos de referencia

- `prd_mounjaro.md` — PRD completo con todos los módulos
- `db_schema.md` — esquema detallado de tablas, RLS y consultas SQL clave
