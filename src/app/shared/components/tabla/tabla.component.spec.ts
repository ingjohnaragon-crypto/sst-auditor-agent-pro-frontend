import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaComponent } from './tabla.component';

interface Fila {
  id: number;
  nombre: string;
}

describe('TablaComponent', () => {
  let fixture: ComponentFixture<TablaComponent<Fila>>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaComponent<Fila>);
    fixture.componentRef.setInput('columnas', [
      { clave: 'nombre', encabezado: 'Nombre', ordenable: true },
    ]);
    fixture.componentRef.setInput('datos', [{ id: 1, nombre: 'Ana' }]);
    fixture.detectChanges();
  });

  it('should mostrar las filas recibidas', () => {
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ana');
  });

  it('should emitir el orden solicitado y mostrar flecha desc', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alOrdenar, 'emit');
    const boton = (fixture.nativeElement as HTMLElement).querySelector('thead button');
    boton?.click();
    expect(emitir).toHaveBeenCalledWith({ columna: 'nombre', direccion: 'asc' });
    fixture.detectChanges();
    expect(boton?.textContent).toContain('↑');

    boton?.click();
    expect(emitir).toHaveBeenCalledWith({ columna: 'nombre', direccion: 'desc' });
    fixture.detectChanges();
    expect(boton?.textContent).toContain('↓');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('th')?.getAttribute('aria-sort')
    ).toBe('descending');
  });

  it('should mostrar mensaje vacio sin filas', () => {
    fixture.componentRef.setInput('datos', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay datos para mostrar'
    );
  });

  it('should mostrar skeleton mientras carga', () => {
    fixture.componentRef.setInput('cargando', true);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.animate-pulse').length
    ).toBeGreaterThan(0);
  });

  it('should emitir alCambiarPagina', () => {
    fixture.componentRef.setInput('datos', [
      { id: 1, nombre: 'Ana' },
      { id: 2, nombre: 'Bea' },
      { id: 3, nombre: 'Carla' },
    ]);
    fixture.componentRef.setInput('paginacion', { tamanoPagina: 2 });
    fixture.detectChanges();
    const emitir = jest.spyOn(fixture.componentInstance.alCambiarPagina, 'emit');
    const siguiente = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('nav button')
    ).find((b) => b.textContent?.includes('Siguiente')) as HTMLButtonElement;
    expect(siguiente).toBeTruthy();
    siguiente.click();
    expect(emitir).toHaveBeenCalledWith(1);
  });
});
