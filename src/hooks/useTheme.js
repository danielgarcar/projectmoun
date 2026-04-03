import { useState, useEffect, useCallback } from 'react';

/**
 * useTheme — Gestiona el tema oscuro/claro de la aplicación.
 * Persiste en localStorage bajo la clave "mt-theme".
 * Acepta un `initialTheme` externo (de BD) para sincronizar.
 * Aplica `data-theme` al elemento <html>.
 */
export function useTheme(initialTheme) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mt-theme') || 'dark'; }
    catch { return 'dark'; }
  });

  // Cuando llega el valor de BD, lo aplica (solo si difiere del local)
  useEffect(() => {
    if (initialTheme && initialTheme !== theme) {
      setTheme(initialTheme);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mt-theme', theme); } catch { /* storage bloqueado */ }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0a0a' : '#f2f2f2';
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  return { theme, isDark: theme === 'dark', toggle };
}
