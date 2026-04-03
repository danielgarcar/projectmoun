import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Anima un número desde 0 hasta `value` cuando el componente se monta
 * o cuando `value` cambia.
 *
 * @param {number|string|null} value  - Valor objetivo (puede ser "75.3", "+2.5", "-1.2", null)
 * @param {object}             opts
 * @param {number}  opts.duration  - Duración en segundos (default 0.8)
 * @param {string}  opts.suffix    - Sufijo añadido tras el número (ej. 'd', '%')
 * @param {Function|null} opts.formatter - Función (animatedFloat) => string para formato personalizado
 * @returns {React.RefObject} - Adjuntar al <span> que muestra el número
 */
export function useCountUp(value, { duration = 0.8, suffix = '', formatter = null } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const str   = String(value ?? '')
    const num   = parseFloat(str)

    // Si no es numérico (p.ej. '—') no animamos, dejamos el textContent de React
    if (isNaN(num)) return

    const hasPlus  = str.startsWith('+')
    const hasMinus = str.startsWith('-')
    const sign     = hasPlus ? '+' : hasMinus ? '-' : ''
    const dotIdx   = str.indexOf('.')
    const decimals = dotIdx >= 0 ? str.length - dotIdx - 1 : 0
    const absTarget = Math.abs(num)

    // Función de formateo durante la animación
    const fmt = (v) => {
      if (formatter) return formatter(v)
      return `${sign}${v.toFixed(decimals)}${suffix}`
    }

    // Partimos de cero antes de animar
    ref.current.textContent = fmt(0)

    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: absTarget,
      duration,
      ease: 'power2.out',
      onUpdate() {
        if (ref.current) ref.current.textContent = fmt(obj.val)
      },
      onComplete() {
        if (!ref.current) return
        // Restaurar el valor exacto final
        if (formatter) {
          ref.current.textContent = formatter(num)
        } else {
          ref.current.textContent = `${str}${suffix}`
        }
      },
    })

    return () => tween.kill()
  }, [value, duration, suffix]) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
