import type { ValidatorFn } from '@angular/forms';

export type TipoCampoFormulario =
  | 'texto'
  | 'area-texto'
  | 'numero'
  | 'selector'
  | 'radio'
  | 'checkbox'
  | 'chips'
  | 'selector-multiple'
  | 'carga-archivo';

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
}

/**
 * Configuración de un campo del formulario dinámico.
 * Si `checkbox` trae `opciones`, el valor es `string[]` (grupo); si no, `boolean`.
 */
export interface CampoFormulario {
  nombre: string;
  tipo: TipoCampoFormulario;
  etiqueta: string;
  requerido?: boolean;
  opciones?: OpcionCampo[];
  validadores?: ValidatorFn[];
  placeholder?: string;
  ayuda?: string;
  deshabilitado?: boolean;
  min?: number;
  max?: number;
  step?: number;
  filas?: number;
  aceptar?: string;
  multiple?: boolean;
  valorInicial?: unknown;
}
