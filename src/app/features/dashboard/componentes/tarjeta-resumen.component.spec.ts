import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TarjetaResumenComponent } from './tarjeta-resumen.component';

describe('TarjetaResumenComponent', () => {
  let fixture: ComponentFixture<TarjetaResumenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaResumenComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TarjetaResumenComponent);
    fixture.componentRef.setInput('titulo', 'Puntaje 0312');
    fixture.componentRef.setInput('valor', '85 %');
    fixture.componentRef.setInput('subtitulo', 'Resultado actual');
    fixture.detectChanges();
  });

  it('should mostrar titulo, valor y subtitulo', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;

    expect(texto).toContain('Puntaje 0312');
    expect(texto).toContain('85 %');
    expect(texto).toContain('Resultado actual');
  });
});
