import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { ArchivoDocumental } from '../../modelos';
import { ListaArchivosComponent } from './lista-archivos.component';

describe('ListaArchivosComponent', () => {
  let fixture: ComponentFixture<ListaArchivosComponent>;
  let componente: ListaArchivosComponent;

  const archivo: ArchivoDocumental = {
    id: 'a1',
    empresa_id: 'e1',
    nombre_original: 'acta.pdf',
    tipo_mime: 'application/pdf',
    tamano_bytes: 2048,
    fecha_carga: '2026-09-24T00:00:00Z',
    usuario_id: 'u1',
    usuario_nombre: 'Ana',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaArchivosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaArchivosComponent);
    componente = fixture.componentInstance;
    fixture.componentRef.setInput('archivos', [archivo]);
    fixture.detectChanges();
  });

  it('should mostrar nombre y quien cargo', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('acta.pdf');
    expect(texto).toContain('Ana');
  });

  it('should ocultar Eliminar when no puede escribir', () => {
    fixture.componentRef.setInput('puedeEscribir', false);
    fixture.detectChanges();
    const botones = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    const textos = Array.from(botones).map((b) => b.textContent?.trim());
    expect(textos).toContain('Descargar');
    expect(textos).not.toContain('Eliminar');
  });

  it('should emitir alEliminar when puede escribir', () => {
    fixture.componentRef.setInput('puedeEscribir', true);
    fixture.detectChanges();
    const spy = jest.spyOn(componente.alEliminar, 'emit');
    const eliminar = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button')
    ).find((b) => b.textContent?.includes('Eliminar'));
    expect(eliminar).toBeTruthy();
    eliminar?.click();
    expect(spy).toHaveBeenCalledWith(archivo);
  });

  it('should mostrar vacio when no hay archivos', () => {
    fixture.componentRef.setInput('archivos', []);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay archivos documentales'
    );
  });

  it('should usar etiqueta generica when no hay nombre de usuario', () => {
    expect(
      componente.quienCargo({ ...archivo, usuario_nombre: null })
    ).toBe('Usuario desconocido');
  });
});