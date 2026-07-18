import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BarraLateralComponent } from './barra-lateral.component';

describe('BarraLateralComponent', () => {
  let fixture: ComponentFixture<BarraLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraLateralComponent);
    fixture.detectChanges();
  });

  it('should mostrar el acceso al dashboard', () => {
    const dashboard = (fixture.nativeElement as HTMLElement).querySelector(
      'a[aria-label="Dashboard"]'
    );

    expect(dashboard?.getAttribute('href')).toBe('/dashboard');
  });

  it('should marcar diagnostico como proximamente', () => {
    const diagnostico = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Diagnóstico, próximamente"]'
    );

    expect(diagnostico?.getAttribute('aria-disabled')).toBe('true');
  });
});
