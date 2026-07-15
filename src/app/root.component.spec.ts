import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RootComponent } from './root.component';
import { ServicioSalud } from './nucleo/servicios/servicio-salud';

describe('RootComponent', () => {
  let fixture: ComponentFixture<RootComponent>;
  let servicio: { obtenerPing: jest.Mock };

  beforeEach(async () => {
    servicio = {
      obtenerPing: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RootComponent],
      providers: [{ provide: ServicioSalud, useValue: servicio }],
    }).compileComponents();
  });

  it('should show ping message when the service succeeds', () => {
    servicio.obtenerPing.mockReturnValue(of({ mensaje: 'pong' }));
    fixture = TestBed.createComponent(RootComponent);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('pong');
    expect(texto).not.toContain('Cargando ping');
  });

  it('should show an error message when the service fails', () => {
    servicio.obtenerPing.mockReturnValue(throwError(() => new Error('network')));
    fixture = TestBed.createComponent(RootComponent);
    fixture.detectChanges();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('No se pudo obtener el ping');
    expect(texto).not.toContain('Cargando ping');
  });
});
