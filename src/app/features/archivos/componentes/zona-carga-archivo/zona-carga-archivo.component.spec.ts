import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonaCargaArchivoComponent } from './zona-carga-archivo.component';

describe('ZonaCargaArchivoComponent', () => {
  let fixture: ComponentFixture<ZonaCargaArchivoComponent>;
  let componente: ZonaCargaArchivoComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonaCargaArchivoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ZonaCargaArchivoComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emitir archivo al cambiar el input', () => {
    const spy = jest.spyOn(componente.alSeleccionarArchivo, 'emit');
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const archivo = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    Object.defineProperty(input, 'files', { value: [archivo] });
    input.dispatchEvent(new Event('change'));
    expect(spy).toHaveBeenCalledWith(archivo);
  });

  it('should no emitir when deshabilitado al soltar', () => {
    componente.deshabilitado = true;
    const spy = jest.spyOn(componente.alSeleccionarArchivo, 'emit');
    const archivo = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    const evento = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [archivo] },
    } as unknown as DragEvent;
    componente.alSoltar(evento);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emitir al soltar archivo', () => {
    const spy = jest.spyOn(componente.alSeleccionarArchivo, 'emit');
    const archivo = new File(['%PDF'], 'acta.pdf', { type: 'application/pdf' });
    const evento = {
      preventDefault: jest.fn(),
      dataTransfer: { files: [archivo] },
    } as unknown as DragEvent;
    componente.alSoltar(evento);
    expect(spy).toHaveBeenCalledWith(archivo);
    expect(componente.arrastrando).toBe(false);
  });

  it('should marcar arrastre y salir', () => {
    const over = { preventDefault: jest.fn() } as unknown as DragEvent;
    componente.alArrastrarSobre(over);
    expect(componente.arrastrando).toBe(true);
    componente.alSalirArrastre();
    expect(componente.arrastrando).toBe(false);
  });

  it('should no marcar arrastre when subiendo', () => {
    componente.subiendo = true;
    const over = { preventDefault: jest.fn() } as unknown as DragEvent;
    componente.alArrastrarSobre(over);
    expect(componente.arrastrando).toBe(false);
  });

  it('should no emitir change sin archivo', () => {
    const spy = jest.spyOn(componente.alSeleccionarArchivo, 'emit');
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [] });
    input.dispatchEvent(new Event('change'));
    expect(spy).not.toHaveBeenCalled();
  });

  it('should mostrar error de carga', () => {
    componente.error = 'Solo se permiten PDF, JPEG y PNG.';
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('PDF');
  });
});
