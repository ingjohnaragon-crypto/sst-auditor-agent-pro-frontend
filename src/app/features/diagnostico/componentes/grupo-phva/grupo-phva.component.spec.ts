import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GrupoPhvaComponent } from './grupo-phva.component';

describe('GrupoPhvaComponent', () => {
  let fixture: ComponentFixture<GrupoPhvaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GrupoPhvaComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(GrupoPhvaComponent);
    fixture.componentInstance.ciclo = 'PLANEAR';
    fixture.componentInstance.items = [
      {
        id: 'est-1',
        ciclo_phva: 'PLANEAR',
        numeral: '1.1.1',
        descripcion: 'Recursos',
        valor_porcentual: '4.00',
      },
    ];
    fixture.detectChanges();
  });

  it('should renderizar items del ciclo', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(texto).toContain('I. Planear');
    expect(texto).toContain('Recursos');
    expect(texto).toContain('1.1.1');
    expect(texto).toContain('0 / 1');
  });
});
