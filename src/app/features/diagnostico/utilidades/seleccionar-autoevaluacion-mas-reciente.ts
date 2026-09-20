export interface AutoevaluacionOrdenable {
  id: string;
  fecha: string;
  fecha_creacion: string;
}

export function seleccionarAutoevaluacionMasReciente<T extends AutoevaluacionOrdenable>(
  items: T[]
): T | null {
  if (items.length === 0) {
    return null;
  }

  return [...items].sort((a, b) => {
    const porFecha = b.fecha.localeCompare(a.fecha);
    if (porFecha !== 0) {
      return porFecha;
    }
    return b.fecha_creacion.localeCompare(a.fecha_creacion);
  })[0];
}
