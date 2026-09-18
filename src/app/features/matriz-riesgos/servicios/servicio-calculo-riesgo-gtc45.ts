import { Injectable } from '@angular/core';

import type {
  AceptabilidadRiesgo,
  InterpretacionNR,
  NivelConsecuencia,
  NivelDeficiencia,
  NivelExposicion,
  ResultadoCalculoGtc45,
} from '../modelos';

const ND_VALIDOS = new Set<number>([10, 6, 2, 0]);
const NE_VALIDOS = new Set<number>([4, 3, 2, 1]);
const NC_VALIDOS = new Set<number>([100, 60, 25, 10]);

const ACEPTABILIDAD_POR_INTERPRETACION: Record<InterpretacionNR, AceptabilidadRiesgo> = {
  I: 'NO_ACEPTABLE',
  II: 'ACEPTABLE_CON_CONTROL',
  III: 'MEJORABLE',
  IV: 'ACEPTABLE',
};

/**
 * Motor de preview GTC 45 en el cliente.
 * Espeja `evaluacion_riesgo.py` / `gtc45.py`; la persistencia sigue en el backend.
 */
@Injectable({ providedIn: 'root' })
export class ServicioCalculoRiesgoGtc45 {
  calcular(
    nivelDeficiencia: number | null | undefined,
    nivelExposicion: number | null | undefined,
    nivelConsecuencia: number | null | undefined,
  ): ResultadoCalculoGtc45 | null {
    if (
      !this.esNdValido(nivelDeficiencia) ||
      !this.esNeValido(nivelExposicion) ||
      !this.esNcValido(nivelConsecuencia)
    ) {
      return null;
    }

    const nd = nivelDeficiencia as NivelDeficiencia;
    const ne = nivelExposicion as NivelExposicion;
    const nc = nivelConsecuencia as NivelConsecuencia;
    const nivel_probabilidad = nd * ne;
    const nivel_riesgo = nivel_probabilidad * nc;
    const interpretacion_nr = this.interpretarNr(nivel_riesgo);
    if (!interpretacion_nr) {
      return null;
    }

    return {
      nivel_probabilidad,
      nivel_riesgo,
      interpretacion_nr,
      aceptabilidad: ACEPTABILIDAD_POR_INTERPRETACION[interpretacion_nr],
    };
  }

  interpretarNr(nivelRiesgo: number): InterpretacionNR | null {
    if (600 <= nivelRiesgo && nivelRiesgo <= 4000) {
      return 'I';
    }
    if (150 <= nivelRiesgo && nivelRiesgo <= 500) {
      return 'II';
    }
    if (40 <= nivelRiesgo && nivelRiesgo <= 120) {
      return 'III';
    }
    if (0 <= nivelRiesgo && nivelRiesgo <= 20) {
      return 'IV';
    }
    return null;
  }

  private esNdValido(valor: number | null | undefined): valor is NivelDeficiencia {
    return typeof valor === 'number' && ND_VALIDOS.has(valor);
  }

  private esNeValido(valor: number | null | undefined): valor is NivelExposicion {
    return typeof valor === 'number' && NE_VALIDOS.has(valor);
  }

  private esNcValido(valor: number | null | undefined): valor is NivelConsecuencia {
    return typeof valor === 'number' && NC_VALIDOS.has(valor);
  }
}
