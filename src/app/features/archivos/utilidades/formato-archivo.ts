export function dispararDescargaBlob(blob: Blob, nombre: string): void {
  const url = URL.createObjectURL(blob);
  const ancla = document.createElement('a');
  ancla.href = url;
  ancla.download = nombre;
  ancla.rel = 'noopener';
  document.body.appendChild(ancla);
  ancla.click();
  ancla.remove();
  URL.revokeObjectURL(url);
}

export function formatearTamanoBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
