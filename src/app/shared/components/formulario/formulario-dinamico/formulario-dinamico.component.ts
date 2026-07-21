import { NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subscription } from 'rxjs';

import { BotonComponent } from '../../boton/boton.component';
import type { CampoFormulario, TipoCampoFormulario } from '../campo-formulario.model';
import { CampoAreaTextoComponent } from '../campo-area-texto/campo-area-texto.component';
import { CampoCargaArchivoComponent } from '../campo-carga-archivo/campo-carga-archivo.component';
import { CampoCheckboxComponent } from '../campo-checkbox/campo-checkbox.component';
import { CampoChipsComponent } from '../campo-chips/campo-chips.component';
import { CampoNumeroComponent } from '../campo-numero/campo-numero.component';
import { CampoRadioComponent } from '../campo-radio/campo-radio.component';
import { CampoSelectorComponent } from '../campo-selector/campo-selector.component';
import { CampoSelectorMultipleComponent } from '../campo-selector-multiple/campo-selector-multiple.component';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';
import { MensajeErrorCampoComponent } from '../mensaje-error-campo/mensaje-error-campo.component';

@Component({
  selector: 'app-formulario-dinamico',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgSwitch,
    NgSwitchCase,
    ReactiveFormsModule,
    BotonComponent,
    MensajeErrorCampoComponent,
    CampoTextoComponent,
    CampoAreaTextoComponent,
    CampoNumeroComponent,
    CampoSelectorComponent,
    CampoRadioComponent,
    CampoCheckboxComponent,
    CampoChipsComponent,
    CampoSelectorMultipleComponent,
    CampoCargaArchivoComponent,
  ],
  templateUrl: './formulario-dinamico.component.html',
  styleUrls: ['./formulario-dinamico.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioDinamicoComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) campos: CampoFormulario[] = [];
  @Input() etiquetaEnviar = 'Enviar';
  @Input() mostrarBotonEnviar = true;

  @Output() alEnviar = new EventEmitter<Record<string, unknown>>();
  @Output() alCambiar = new EventEmitter<Record<string, unknown>>();

  formulario = new FormGroup({});
  private readonly cdr = inject(ChangeDetectorRef);
  private suscripcionCambios: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['campos']) {
      this.reconstruirFormulario();
    }
  }

  ngOnDestroy(): void {
    this.suscripcionCambios?.unsubscribe();
  }

  idCampo(nombre: string): string {
    return `campo-${nombre}`;
  }

  idError(nombre: string): string {
    return `error-${nombre}`;
  }

  controlDe(nombre: string): FormControl {
    return this.formulario.get(nombre) as FormControl;
  }

  esCheckboxSimple(campo: CampoFormulario): boolean {
    return campo.tipo === 'checkbox' && !(campo.opciones && campo.opciones.length > 0);
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.alEnviar.emit(this.formulario.getRawValue() as Record<string, unknown>);
  }

  private reconstruirFormulario(): void {
    this.suscripcionCambios?.unsubscribe();
    const controles: Record<string, FormControl> = {};

    for (const campo of this.campos ?? []) {
      const validadores = [
        ...(campo.requerido ? [Validators.required] : []),
        ...(campo.validadores ?? []),
      ];
      controles[campo.nombre] = new FormControl(
        {
          value: campo.valorInicial ?? this.valorPorDefecto(campo),
          disabled: !!campo.deshabilitado,
        },
        validadores
      );
    }

    this.formulario = new FormGroup(controles);
    this.suscripcionCambios = this.formulario.valueChanges.subscribe(() => {
      this.alCambiar.emit(this.formulario.getRawValue() as Record<string, unknown>);
    });
    this.cdr.markForCheck();
  }

  private valorPorDefecto(campo: CampoFormulario): unknown {
    const tipo: TipoCampoFormulario = campo.tipo;
    switch (tipo) {
      case 'checkbox':
        return campo.opciones && campo.opciones.length > 0 ? [] : false;
      case 'chips':
      case 'selector-multiple':
        return [];
      case 'numero':
        return null;
      case 'carga-archivo':
        return null;
      default:
        return '';
    }
  }
}
