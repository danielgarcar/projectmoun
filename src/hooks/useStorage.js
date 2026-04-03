import { supabase } from '../lib/supabase';

const BUCKET = 'mounjaro-photos';

/**
 * useStorage — Gestiona subida y borrado de fotos en Supabase Storage.
 * Bucket: "mounjaro-photos" (debe crearse en el panel de Supabase con acceso público o firmado)
 */
export function useStorage() {
  /**
   * Sube un archivo al bucket y devuelve la URL pública.
   * @param {File} file - Archivo a subir
   * @param {string} userId - ID del usuario (carpeta raíz)
   * @param {'peso'|'comida'|'perfil'} folder - Subcarpeta
   */
  async function uploadPhoto(file, userId, folder = 'peso') {
    if (!file || !userId) throw new Error('Archivo o usuario no válido');

    const ext  = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Elimina una foto del bucket a partir de su URL pública.
   * @param {string} url - URL pública del archivo
   */
  async function deletePhoto(url) {
    if (!url) return;
    try {
      // Extrae el path relativo al bucket desde la URL
      const marker = `/${BUCKET}/`;
      const idx = url.indexOf(marker);
      if (idx === -1) return;
      const path = url.slice(idx + marker.length);
      await supabase.storage.from(BUCKET).remove([path]);
    } catch { /* Silenciar errores de borrado — la foto puede que ya no exista */ }
  }

  return { uploadPhoto, deletePhoto };
}
