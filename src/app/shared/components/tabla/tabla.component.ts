import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ColumnaTabla } from './columna-tabla.model';

type DireccionOrden = 'asc' | 'desc';

@Component({
  selector: 'app-tabla', standalone: true, imports: [NgFor, NgIf], templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css'], changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaComponent<T> {
  @Input({ required: true }) columnas: ColumnaTabla<T>[] = [];
  @Input({ required: true }) datos: T[] = [];
  @Input() cargando = false;
  @Input() paginacion: { tamanoPagina: number } | null = null;
  @Input() trackearPor: (item: T) => unknown = (item) => item;
  @Input() mensajeVacio = 'No hay datos para mostrar';
  @Output() alOrdenar = new EventEmitter<{ columna: string; direccion: DireccionOrden }>();
  @Output() alCambiarPagina = new EventEmitter<number>();
  paginaActual = 0;
  columnaOrdenada = '';
  direccionOrden: DireccionOrden = 'asc';

  get filasVisibles(): T[] {
    if (!this.paginacion) return this.datos;
    const inicio = this.paginaActual * this.paginacion.tamanoPagina;
    return this.datos.slice(inicio, inicio + this.paginacion.tamanoPagina);
  }
  get totalPaginas(): number { return this.paginacion ? Math.max(1, Math.ceil(this.datos.length / this.paginacion.tamanoPagina)) : 1; }
  valor(item: T, columna: ColumnaTabla<T>): string { return columna.plantilla?.(item) ?? String((item as Record<string, unknown>)[columna.clave] ?? ''); }
  trackearFila = (indice: number, item: T): unknown => this.trackearPor(item) ?? indice;
  ordenar(columna: ColumnaTabla<T>): void {
    if (!columna.ordenable) return;
    this.direccionOrden =
      this.columnaOrdenada === columna.clave && this.direccionOrden === 'asc' ? 'desc' : 'asc';
    this.columnaOrdenada = columna.clave;
    this.alOrdenar.emit({ columna: columna.clave, direccion: this.direccionOrden });
  }

  cambiarPagina(pagina: number): void {
    if (pagina < 0 || pagina >= this.totalPaginas) return;
    this.paginaActual = pagina;
    this.alCambiarPagina.emit(pagina);
  }

  indicadorOrden(clave: string): string {
    if (this.columnaOrdenada !== clave) {
      return '↕';
    }
    return this.direccionOrden === 'asc' ? '↑' : '↓';
  }

  ariaSort(clave: string): 'ascending' | 'descending' | 'none' | null {
    if (this.columnaOrdenada !== clave) {
      return null;
    }
    return this.direccionOrden === 'asc' ? 'ascending' : 'descending';
  }
}
