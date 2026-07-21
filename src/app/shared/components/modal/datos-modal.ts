export interface DatosModal {
  titulo?: string;
  cerrable?: boolean;
  /** Texto del cuerpo cuando se abre vía `ServicioModal` + `DIALOG_DATA`. */
  mensaje?: string;
}
