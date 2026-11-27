import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PestanasFasePhvaComponent } from './pestanas-fase-phva.component';

describe('PestanasFasePhvaComponent', () => {
  let fixture: ComponentFixture<PestanasFasePhvaComponent>;
  let componente: PestanasFasePhvaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PestanasFasePhvaComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PestanasFasePhvaComponent);
    componente = fixture.componentInstance;
    componente.faseActiva = 'PLANEAR';
    fixture.detectChanges();
  });

  it('should emitir alCambiarFase when se elige otra fase', () => {
    const spy = jest.spyOn(componente.alCambiarFase, 'emit');
    componente.seleccionar('HACER');
    expect(spy).toHaveBeenCalledWith('HACER');
  });

  it('should no emitir when la fase ya está activa', () => {
    const spy = jest.spyOn(componente.alCambiarFase, 'emit');
    componente.seleccionar('PLANEAR');
    expect(spy).not.toHaveBeenCalled();
  });
});
