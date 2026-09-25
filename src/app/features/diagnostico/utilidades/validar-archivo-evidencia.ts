export const TAMANO_MAXIMO_EVIDENCIA_BYTES = 10 * 1024 * 1024;

const MIME_PERMITIDOS = new Set(['application/pdf', 'image/jpeg', 'image/png']);

const EXTENSIONES_PERMITIDAS = new Set(['.pdf', '.jpg', '.jpeg', '.png']);

export function validarArchivoEvidencia(archivo: File): string | null {
  const nombre = archivo.name.trim();
  if (!nombre) {
    return 'El archivo no tiene nombre.';
  }
  const punto = nombre.lastIndexOf('.');
  const extension = punto >= 0 ? nombre.slice(punto).toLowerCase() : '';
  if (!EXTENSIONES_PERMITIDAS.has(extension)) {
    return 'Solo se permiten PDF, JPEG y PNG.';
  }
  const mime = archivo.type.trim().toLowerCase();
  if (!MIME_PERMITIDOS.has(mime)) {
    return 'Solo se permiten PDF, JPEG y PNG.';
  }
  if (archivo.size > TAMANO_MAXIMO_EVIDENCIA_BYTES) {
    return 'El archivo supera el límite de 10 MB.';
  }
  if (archivo.size <= 0) {
    return 'El archivo está vacío.';
  }
  return null;
}
