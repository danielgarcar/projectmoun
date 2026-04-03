# DB Schema — MounjaroTracker

## Diagrama de relaciones

```
auth.users
    │
    ├──► profiles          (1:1)
    ├──► dosis             (1:N)
    ├──► pesos             (1:N)
    ├──► comidas           (1:N)
    ├──► diario            (1:N)
    └──► sesiones          (1:N)
                │
                └──► ejercicios    (1:N)
                          │
                          └──► series    (1:N)
```

---

## Tablas

### `profiles`
Extiende el usuario de Supabase Auth con datos del proceso.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | Igual al `auth.users.id` |
| `nombre` | text | Nombre visible |
| `avatar_url` | text | URL en Supabase Storage |
| `peso_inicial_kg` | numeric(5,2) | Peso al iniciar el tratamiento |
| `peso_objetivo_kg` | numeric(5,2) | Meta de peso |
| `fecha_inicio_tratamiento` | date | Fecha del primer pinchazo |
| `unidad_peso` | text | `'kg'` o `'lb'` |
| `created_at` | timestamptz | Auto |

---

### `dosis`
Una fila por cada aplicación de Mounjaro.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fecha` | timestamptz | Fecha y hora de aplicación |
| `dosis_mg` | numeric(4,1) | 2.5 / 5 / 7.5 / 10 / 12.5 / 15 |
| `zona` | text | `'abdomen'` / `'muslo'` / `'brazo'` |
| `efectos_secundarios` | text[] | Array: `['nauseas','fatiga',...]` |
| `notas` | text | Texto libre |
| `created_at` | timestamptz | Auto |

**Lógica derivada:**
- Próxima dosis = `MAX(fecha) + 7 days` — calculado en cliente
- Historial de escalada de dosis = agrupar por `dosis_mg` ordenado por `fecha`

---

### `pesos`
Registro cronológico del peso corporal.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fecha` | date | Día de la medición |
| `peso` | numeric(5,2) | En la unidad configurada en profiles |
| `foto_url` | text | URL en Supabase Storage (opcional) |
| `nota` | text | Texto libre (opcional) |
| `created_at` | timestamptz | Auto |

**Lógica derivada:**
- Diferencia total = `peso_actual - profiles.peso_inicial_kg`
- % perdido = `(diferencia / peso_inicial) * 100`
- Progreso hacia objetivo = `(diferencia / (peso_inicial - peso_objetivo)) * 100`

---

### `comidas`
Una fila por cada ingesta registrada.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fecha` | timestamptz | Fecha y hora de la comida |
| `tipo` | text | `'desayuno'` / `'almuerzo'` / `'cena'` / `'snack'` |
| `descripcion` | text | Lo que se comió |
| `calorias` | integer | Estimación (opcional) |
| `hambre_antes` | smallint | 1–5 |
| `saciedad_despues` | smallint | 1–5 |
| `foto_url` | text | URL en Supabase Storage (opcional) |
| `created_at` | timestamptz | Auto |

**Lógica derivada:**
- Calorías del día = `SUM(calorias) WHERE fecha::date = hoy`
- Promedio hambre/saciedad semanal = `AVG` agrupado por semana

---

### `sesiones`
Cabecera de cada sesión de entrenamiento.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fecha_inicio` | timestamptz | Inicio de la sesión |
| `fecha_fin` | timestamptz | Fin (opcional, para calcular duración real) |
| `duracion_min` | integer | Minutos totales (manual o calculado) |
| `tipo` | text | `'fuerza'` / `'cardio'` / `'flexibilidad'` / `'caminata'` / `'mixto'` / `'otro'` |
| `sensacion_general` | smallint | 1–10 post-entreno |
| `energia_antes` | smallint | 1–10 antes de entrenar |
| `calorias_quemadas` | integer | Estimación (opcional) |
| `notas` | text | Texto libre |
| `created_at` | timestamptz | Auto |

---

### `ejercicios`
Cada ejercicio dentro de una sesión.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `sesion_id` | uuid FK → sesiones | |
| `nombre` | text | Nombre del ejercicio |
| `grupo_muscular` | text | `'pecho'` / `'espalda'` / `'piernas'` / `'hombros'` / `'biceps'` / `'triceps'` / `'core'` / `'cardio'` / `'full_body'` |
| `orden` | smallint | Posición dentro de la sesión (1, 2, 3…) |
| `nota` | text | Técnica, dolor, ajuste (opcional) |
| `created_at` | timestamptz | Auto |

---

### `series`
Cada serie de un ejercicio. Nivel más granular de la sesión.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `ejercicio_id` | uuid FK → ejercicios | |
| `numero_serie` | smallint | 1, 2, 3… |
| `reps` | smallint | Repeticiones realizadas |
| `peso` | numeric(6,2) | Peso en kg o lb |
| `rir` | smallint | Reps In Reserve (0–5) |
| `sensacion` | text | `'facil'` / `'moderada'` / `'dificil'` / `'fallo'` |
| `descanso_seg` | smallint | Descanso tras la serie (opcional) |
| `nota` | text | Texto libre (opcional) |
| `created_at` | timestamptz | Auto |

---

### `diario`
Entradas del diario personal.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `fecha` | date | Día de la entrada |
| `contenido` | text | Texto libre |
| `etiquetas` | text[] | `['bienestar','logro',...]` |
| `valoracion` | smallint | 1–5 estrellas |
| `created_at` | timestamptz | Auto |

---

## Políticas RLS (Row Level Security)

Todas las tablas siguen el mismo patrón:

```sql
-- Lectura: solo los propios registros
CREATE POLICY "select_own" ON tabla
  FOR SELECT USING (auth.uid() = user_id);

-- Inserción: solo como usuario autenticado
CREATE POLICY "insert_own" ON tabla
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Actualización y borrado: solo los propios
CREATE POLICY "update_own" ON tabla
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own" ON tabla
  FOR DELETE USING (auth.uid() = user_id);
```

> Para `ejercicios` y `series` el `user_id` se valida a través del join con `sesiones`:
> ```sql
> USING (sesion_id IN (SELECT id FROM sesiones WHERE user_id = auth.uid()))
> ```

---

## Supabase Storage

| Bucket | Acceso | Uso |
|---|---|---|
| `avatars` | Privado | Fotos de perfil |
| `fotos-peso` | Privado | Fotos corporales en registros de peso |
| `fotos-comida` | Privado | Fotos de platos |

Ruta de archivos: `{user_id}/{timestamp}_{filename}`

---

## Consultas clave (ejemplos)

### Evolución de peso
```sql
SELECT fecha, peso
FROM pesos
WHERE user_id = auth.uid()
ORDER BY fecha ASC;
```

### Progresión de un ejercicio (peso máximo por sesión)
```sql
SELECT s.fecha_inicio::date AS fecha, MAX(sr.peso) AS peso_maximo
FROM series sr
JOIN ejercicios e ON sr.ejercicio_id = e.id
JOIN sesiones s ON e.sesion_id = s.id
WHERE s.user_id = auth.uid()
  AND e.nombre = 'Press banca'
GROUP BY s.fecha_inicio::date
ORDER BY fecha ASC;
```

### Volumen semanal de entrenamiento
```sql
SELECT DATE_TRUNC('week', s.fecha_inicio) AS semana,
       SUM(sr.reps * sr.peso) AS volumen_total
FROM series sr
JOIN ejercicios e ON sr.ejercicio_id = e.id
JOIN sesiones s ON e.sesion_id = s.id
WHERE s.user_id = auth.uid()
GROUP BY semana
ORDER BY semana ASC;
```

### Calorías diarias últimos 7 días
```sql
SELECT fecha::date AS dia, SUM(calorias) AS total_calorias
FROM comidas
WHERE user_id = auth.uid()
  AND fecha >= NOW() - INTERVAL '7 days'
GROUP BY dia
ORDER BY dia ASC;
```

### Próxima dosis
```sql
SELECT fecha + INTERVAL '7 days' AS proxima_dosis
FROM dosis
WHERE user_id = auth.uid()
ORDER BY fecha DESC
LIMIT 1;
```
