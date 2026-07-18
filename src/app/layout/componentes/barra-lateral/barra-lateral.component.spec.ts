import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { BarraLateralComponent } from './barra-lateral.component';

describe('BarraLateralComponent', () => {
  let fixture: ComponentFixture<BarraLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralComponent],
      providers: [provideRouter([{ path: 'dashboard', children: [] }])],
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

  it('should resaltar el enlace activo al navegar al dashboard', async () => {
    await TestBed.inject(Router).navigate(['/dashboard']);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const dashboard = (fixture.nativeElement as HTMLElement).querySelector(
      'a[aria-label="Dashboard"]'
    );

    expect(dashboard?.classList.contains('bg-indigo-600')).toBe(true);
    expect(dashboard?.classList.contains('text-white')).toBe(true);
  });

  it('should marcar diagnostico como proximamente', () => {
    const diagnostico = (fixture.nativeElement as HTMLElement).querySelector(
      '[aria-label="Diagnóstico, próximamente"]'
    );

    expect(diagnostico?.getAttribute('aria-disabled')).toBe('true');
  });
});
