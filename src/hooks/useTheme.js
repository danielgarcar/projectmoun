import { useState, useEffect, useCallback } from 'react';

/**
 * useTheme — Gestiona el tema oscuro/claro de la aplicación.
 * Persiste en localStorage bajo la clave "mt-theme".
 * Aplica `data-theme` al elemento <html>.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('mt-theme') || 'dark'; }
    catch { return 'dark'; }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('mt-theme', theme); } catch { /* storage bloqueado */ }
    // Actualiza el meta theme-color dinámicamente
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#0a0a0a' : '#f2f2f2';
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);

  return { theme, isDark: theme === 'dark', toggle };
}
