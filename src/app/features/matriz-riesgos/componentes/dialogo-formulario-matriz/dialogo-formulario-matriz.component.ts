import { NgFor, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { AlertaComponent, BotonComponent } from '@app/shared';

import type {
  ClasificacionPeligro,
  NivelConsecuencia,
  NivelDeficiencia,
  NivelExposicion,
  ResultadoCalculoGtc45,
  SolicitudControl,
  SolicitudEvaluacion,
  SolicitudPeligro,
  SolicitudProcesoActividad,
  TipoControl,
} from '../../modelos';
import { ServicioCalculoRiesgoGtc45 } from '../../servicios/servicio-calculo-riesgo-gtc45';
import { SemaforoRiesgoComponent } from '../semaforo-riesgo/semaforo-riesgo.component';

const TEXTO_CON_CONTENIDO = Validators.pattern(/\S/);

export type TipoFormularioMatriz = 'proceso' | 'peligro' | 'evaluacion' | 'control';

export interface DatosFormularioMatriz {
  tipo: TipoFormularioMatriz;
  titulo: string;
  valores?: Record<string, unknown>;
  cantidadControles?: number;
}

export type ResultadoFormularioMatriz =
  | SolicitudProcesoActividad
  | SolicitudPeligro
  | SolicitudEvaluacion
  | SolicitudControl;

@Component({
  selector: 'app-dialogo-formulario-matriz',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    ReactiveFormsModule,
    AlertaComponent,
    BotonComponent,
    SemaforoRiesgoComponent,
  ],
  templateUrl: './dialogo-formulario-matriz.component.html',
  styleUrls: ['./dialogo-formulario-matriz.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogoFormularioMatrizComponent {
  readonly datos = inject<DatosFormularioMatriz>(DIALOG_DATA);
  private readonly dialogo = inject(
    DialogRef<ResultadoFormularioMatriz | undefined, DialogoFormularioMatrizComponent>,
  );
  private readonly calculo = inject(ServicioCalculoRiesgoGtc45);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly clasificaciones: Array<{ valor: ClasificacionPeligro; etiqueta: string }> = [
    { valor: 'BIOLOGICO', etiqueta: 'Biológico' },
    { valor: 'FISICO', etiqueta: 'Físico' },
    { valor: 'QUIMICO', etiqueta: 'Químico' },
    { valor: 'PSICOSOCIAL', etiqueta: 'Psicosocial' },
    { valor: 'BIOMECANICO', etiqueta: 'Biomecánico' },
    { valor: 'CONDICIONES_SEGURIDAD', etiqueta: 'Condiciones de seguridad' },
    { valor: 'FENOMENOS_NATURALES', etiqueta: 'Fenómenos naturales' },
  ];

  readonly tiposControl: Array<{ valor: TipoControl; etiqueta: string }> = [
    { valor: 'ELIMINACION', etiqueta: 'Eliminación' },
    { valor: 'SUSTITUCION', etiqueta: 'Sustitución' },
    { valor: 'INGENIERIA', etiqueta: 'Control de ingeniería' },
    { valor: 'ADMINISTRATIVO', etiqueta: 'Control administrativo' },
    { valor: 'EPP', etiqueta: 'Equipo de protección personal (EPP)' },
  ];

  readonly ndValidos = [10, 6, 2, 0];
  readonly neValidos = [4, 3, 2, 1];
  readonly ncValidos = [100, 60, 25, 10];

  preview: ResultadoCalculoGtc45 | null = null;

  readonly formulario = new FormGroup({
    nombre: new FormControl(this.texto('nombre'), {
      nonNullable: true,
      validators: [Validators.required, TEXTO_CON_CONTENIDO, Validators.maxLength(150)],
    }),
    es_rutinaria: new FormControl(this.booleano('es_rutinaria'), { nonNullable: true }),
    zona_lugar: new FormControl(this.texto('zona_lugar'), {
      nonNullable: true,
      validators: [Validators.maxLength(150)],
    }),
    clasificacion: new FormControl(
      (this.texto('clasificacion') || 'FISICO') as ClasificacionPeligro,
      { nonNullable: true },
    ),
    descripcion: new FormControl(this.texto('descripcion'), {
      nonNullable: true,
      validators: [Validators.required, TEXTO_CON_CONTENIDO],
    }),
    efectos_posibles: new FormControl(this.texto('efectos_posibles'), {
      nonNullable: true,
    }),
    nivel_deficiencia: new FormControl(this.numero('nivel_deficiencia', 2), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nivel_exposicion: new FormControl(this.numero('nivel_exposicion', 2), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nivel_consecuencia: new FormControl(this.numero('nivel_consecuencia', 10), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tipo_control: new FormControl((this.texto('tipo') || 'INGENIERIA') as TipoControl, {
      nonNullable: true,
    }),
  });

  constructor() {
    if (this.datos.tipo === 'evaluacion') {
      this.actualizarPreview();
      this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
        this.actualizarPreview();
        this.cdr.markForCheck();
      });
    }
  }

  get advertirEppUnico(): boolean {
    return (
      this.datos.tipo === 'control' &&
      this.formulario.controls.tipo_control.value === 'EPP' &&
      (this.datos.cantidadControles ?? 0) === 0
    );
  }

  guardar(): void {
    this.activarValidadoresDelTipo();
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const valor = this.formulario.getRawValue();
    let resultado: ResultadoFormularioMatriz;

    switch (this.datos.tipo) {
      case 'proceso':
        resultado = {
          nombre: valor.nombre.trim(),
          es_rutinaria: valor.es_rutinaria,
          zona_lugar: valor.zona_lugar.trim() || null,
        };
        break;
      case 'peligro':
        resultado = {
          clasificacion: valor.clasificacion,
          descripcion: valor.descripcion.trim(),
          efectos_posibles: valor.efectos_posibles.trim() || null,
        };
        break;
      case 'evaluacion':
        resultado = {
          nivel_deficiencia: Number(valor.nivel_deficiencia) as NivelDeficiencia,
          nivel_exposicion: Number(valor.nivel_exposicion) as NivelExposicion,
          nivel_consecuencia: Number(valor.nivel_consecuencia) as NivelConsecuencia,
        };
        break;
      case 'control':
        resultado = {
          tipo: valor.tipo_control,
          descripcion: valor.descripcion.trim(),
        };
        break;
    }

    this.dialogo.close(resultado);
  }

  cancelar(): void {
    this.dialogo.close(undefined);
  }

  private actualizarPreview(): void {
    const valor = this.formulario.getRawValue();
    this.preview = this.calculo.calcular(
      Number(valor.nivel_deficiencia),
      Number(valor.nivel_exposicion),
      Number(valor.nivel_consecuencia),
    );
  }

  private activarValidadoresDelTipo(): void {
    this.formulario.controls.nombre.clearValidators();
    this.formulario.controls.descripcion.clearValidators();
    if (this.datos.tipo === 'proceso') {
      this.formulario.controls.nombre.setValidators([
        Validators.required,
        TEXTO_CON_CONTENIDO,
        Validators.maxLength(150),
      ]);
    }
    if (this.datos.tipo === 'peligro' || this.datos.tipo === 'control') {
      this.formulario.controls.descripcion.setValidators([
        Validators.required,
        TEXTO_CON_CONTENIDO,
      ]);
    }
    this.formulario.controls.nombre.updateValueAndValidity();
    this.formulario.controls.descripcion.updateValueAndValidity();
  }

  private texto(campo: string): string {
    const valor = this.datos.valores?.[campo];
    return typeof valor === 'string' ? valor : '';
  }

  private numero(campo: string, porDefecto: number): number {
    const valor = this.datos.valores?.[campo];
    return typeof valor === 'number' ? valor : porDefecto;
  }

  private booleano(campo: string): boolean {
    return this.datos.valores?.[campo] === true;
  }
}
