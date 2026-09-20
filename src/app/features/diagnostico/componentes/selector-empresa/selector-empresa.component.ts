import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import type { Empresa } from '../../modelos';

@Component({
  selector: 'app-selector-empresa',
  standalone: true,
  imports: [NgFor],
  templateUrl: './selector-empresa.component.html',
  styleUrls: ['./selector-empresa.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectorEmpresaComponent {
  @Input() empresas: Empresa[] = [];
  @Input() empresaId = '';
  @Input() deshabilitado = false;
  @Output() alSeleccionar = new EventEmitter<string>();

  readonly trackEmpresa = (_indice: number, empresa: Empresa): string => empresa.id;
}
