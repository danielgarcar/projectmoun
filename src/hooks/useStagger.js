import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * Anima los hijos directos del contenedor con entrada escalonada (bottom-up).
 *
 * @param {Array} deps - Dependencias que re-disparan la animación (ej. [items.length])
 * @returns {React.RefObject} - Adjuntar al div contenedor de la lista
 */
export function useStagger(deps = []) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    const items = ref.current.querySelectorAll(':scope > *')
    if (!items.length) return

    gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'all',
      }
    )
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  return ref
}
