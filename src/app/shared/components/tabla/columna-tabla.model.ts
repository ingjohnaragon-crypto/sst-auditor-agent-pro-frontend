export interface ColumnaTabla<T> {
  clave: string;
  encabezado: string;
  ordenable?: boolean;
  plantilla?: (item: T) => string;
}
