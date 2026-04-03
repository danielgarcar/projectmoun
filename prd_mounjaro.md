# PRD — MounjaroTracker

## Visión general

Aplicación web tipo SaaS construida en React puro, optimizada para móvil (Android), con Supabase como backend. Permite al usuario llevar un seguimiento integral de su proceso de cambio de peso con Mounjaro: dosis aplicadas, alimentación, entrenamiento, peso corporal y notas personales, todo visualizado con gráficas interactivas.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React (Vite + React Router) |
| UI / Estilos | Tailwind CSS + shadcn/ui |
| Gráficas | Recharts |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| Autenticación | Supabase Auth (email/magic link) |
| Despliegue | Vercel o Netlify (PWA) |

---

## Usuarios objetivo

- Usuario único o familia pequeña (multi-cuenta por email)
- Acceso desde navegador móvil Android (Chrome) y escritorio
- Sin necesidad de instalar app nativa — PWA instalable

---

## Módulos funcionales

### 1. Autenticación
- Login con magic link (email) o email + contraseña
- Sesión persistente con refresh token de Supabase
- Perfil básico: nombre, foto de perfil, peso objetivo, fecha de inicio del tratamiento

---

### 2. Registro de Dosis
Cada entrada registra una aplicación de Mounjaro.

**Campos:**
- Fecha y hora de aplicación
- Dosis (mg): 2.5 / 5 / 7.5 / 10 / 12.5 / 15
- Zona de inyección: abdomen / muslo / brazo
- Efectos secundarios (checkbox múltiple): náuseas, fatiga, dolor de cabeza, estreñimiento, otros
- Notas libres

**Vista:**
- Historial en tarjetas cronológicas
- Recordatorio del próximo pinchazo (calculado a 7 días)
- Badge con dosis actual activa

---

### 3. Registro de Peso
**Campos:**
- Fecha
- Peso (kg o lb — configurable)
- Foto corporal opcional (subida a Supabase Storage)
- Nota corta

**Vista:**
- Gráfica de línea: evolución del peso en el tiempo
- Indicadores: peso inicial, peso actual, diferencia total, % perdido
- Meta de peso objetivo con línea de referencia en la gráfica

---

### 4. Registro de Alimentación
**Campos:**
- Fecha y hora
- Tipo de comida: desayuno / almuerzo / cena / snack
- Descripción libre de lo consumido
- Calorías estimadas (opcional)
- Nivel de hambre antes (1–5) y saciedad después (1–5)
- Foto del plato (opcional, Supabase Storage)

**Vista:**
- Resumen diario de comidas
- Gráfica de barras: calorías diarias en la semana
- Tendencia de hambre vs saciedad

---

### 5. Registro de Entrenamiento
La sesión es el contenedor; los ejercicios son el detalle. Estructura de dos niveles.

#### 5a. Cabecera de sesión
- Fecha y hora de inicio / fin
- Tipo general: fuerza / cardio / flexibilidad / caminata / mixto / otro
- Duración total (calculada o manual, en minutos)
- Sensación general post-entreno (1–10)
- Energía antes del entreno (1–10)
- Calorías quemadas estimadas (opcional)
- Notas libres de la sesión (cómo te sentiste, contexto, etc.)

#### 5b. Ejercicios dentro de la sesión
Cada sesión puede contener N ejercicios. Cada ejercicio registra:

- Nombre del ejercicio (texto libre + sugerencias de historial previo)
- Grupo muscular: pecho / espalda / piernas / hombros / bíceps / tríceps / core / cardio / full body
- Series completadas (número)
- Por cada serie:
  - Repeticiones realizadas
  - Peso utilizado (kg o lb)
  - RIR — Reps In Reserve (0–5): cuántas reps te quedaron en el depósito
  - Sensación de la serie: fácil / moderada / difícil / al fallo
- Tiempo de descanso entre series (segundos, opcional)
- Notas del ejercicio (dolor, técnica, ajuste de peso, etc.)

#### 5c. Progresión y comparativa
- Al registrar un ejercicio, mostrar el último registro de ese mismo ejercicio (peso, reps, sensación)
- Indicador visual si hubo progreso (↑ peso o ↑ reps respecto a sesión anterior)

**Vista:**
- Historial de sesiones en tarjetas expandibles (resumen → detalle de ejercicios)
- Gráfica de línea por ejercicio: evolución del peso máximo levantado en el tiempo
- Gráfica de barras: volumen total semanal (series × reps × peso)
- Gráfica de barras: frecuencia semanal por tipo de sesión
- Total de minutos entrenados por semana

---

### 6. Diario / Opiniones
**Campos:**
- Fecha
- Entrada de texto libre (estado de ánimo, observaciones del proceso, motivación)
- Etiquetas: bienestar / motivación / dificultad / logro
- Valoración del día (1–5 estrellas)

**Vista:**
- Lista cronológica con buscador por texto y filtro por etiqueta
- Nube de etiquetas más frecuentes

---

### 7. Dashboard principal
Pantalla de inicio con resumen del proceso:

- **Tarjetas KPI:**
  - Peso actual vs peso inicial
  - Kg perdidos total
  - Días en tratamiento
  - Próxima dosis en X días
  - Sesiones de entrenamiento esta semana

- **Gráficas:**
  - Línea: evolución de peso (todos los registros)
  - Barras: entrenamientos por semana (últimas 8 semanas)
  - Barras: calorías diarias (últimos 7 días)
  - Línea: dosis aplicadas con hitos de subida de dosis

- **Accesos rápidos** (FAB o botones fijos):
  - + Registrar peso
  - + Registrar dosis
  - + Añadir comida
  - + Añadir entrenamiento

---

## Diseño y UX

- **Mobile-first**: interfaz táctil, botones grandes, scroll vertical
- **Tema oscuro/claro**: toggle en preferencias de usuario
- **PWA**: manifest.json + service worker para instalación en Android y funcionamiento offline básico (lectura de datos cacheados)
- **Navegación**: bottom navigation bar en móvil (Dashboard / Peso / Dosis / Alimentación / Entreno / Diario)
- **Idioma**: español por defecto

---

## Base de datos (Supabase)

### Tablas principales

```
profiles          → id, user_id, nombre, peso_objetivo_kg, fecha_inicio, unidad_peso
dosis             → id, user_id, fecha, dosis_mg, zona, efectos_secundarios[], notas
pesos             → id, user_id, fecha, peso, foto_url, nota
comidas           → id, user_id, fecha, tipo, descripcion, calorias, hambre_antes, saciedad_despues, foto_url
sesiones          → id, user_id, fecha_inicio, fecha_fin, tipo, duracion_min, sensacion_general, energia_antes, calorias_quemadas, notas
ejercicios        → id, sesion_id, nombre, grupo_muscular, orden
series            → id, ejercicio_id, numero_serie, reps, peso, rir, sensacion, descanso_seg, nota
diario            → id, user_id, fecha, contenido, etiquetas[], valoracion
```

- Row Level Security (RLS) activado: cada usuario solo accede a sus propios datos
- `user_id` referencia a `auth.users`

---

## Fases de desarrollo

### Fase 1 — Base
- [ ] Setup Vite + React + Tailwind + Supabase client
- [ ] Autenticación (login / logout / sesión persistente)
- [ ] Perfil de usuario
- [ ] CRUD de peso con gráfica básica

### Fase 2 — Módulos principales
- [ ] CRUD de dosis con recordatorio de próxima aplicación
- [ ] CRUD de entrenamiento
- [ ] CRUD de alimentación

### Fase 3 — Dashboard y gráficas
- [ ] Dashboard con KPIs
- [ ] Gráficas interactivas (Recharts)
- [ ] Módulo de diario

### Fase 4 — PWA y pulido
- [ ] Configuración PWA (manifest + service worker)
- [ ] Tema oscuro / claro
- [ ] Subida de fotos (Supabase Storage)
- [ ] Optimizaciones de rendimiento y UX mobile

---

## Restricciones y consideraciones

- No requiere backend propio: toda la lógica de datos va sobre Supabase directamente desde el cliente
- Sin notificaciones push en v1 (el recordatorio de dosis es visual en pantalla)
- Las fotos se almacenan en Supabase Storage con bucket privado por usuario
- Datos sensibles de salud: RLS estricto, sin compartir con terceros en v1
