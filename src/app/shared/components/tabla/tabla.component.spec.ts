import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaComponent } from './tabla.component';

interface Fila { id: number; nombre: string; }

describe('TablaComponent', () => {
  let fixture: ComponentFixture<TablaComponent<Fila>>;
  beforeEach(() => {
    fixture = TestBed.createComponent(TablaComponent<Fila>);
    fixture.componentInstance.columnas = [{ clave: 'nombre', encabezado: 'Nombre', ordenable: true }];
    fixture.componentInstance.datos = [{ id: 1, nombre: 'Ana' }];
    fixture.detectChanges();
  });

  it('should mostrar las filas recibidas', () => expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ana'));

  it('should emitir el orden solicitado', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alOrdenar, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('thead button')?.click();
    expect(emitir).toHaveBeenCalledWith({ columna: 'nombre', direccion: 'asc' });
  });
});
