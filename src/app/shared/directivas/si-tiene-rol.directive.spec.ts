import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { SiTieneRolDirective } from './si-tiene-rol.directive';
import { ServicioAutenticacion } from '../../nucleo/auth/servicio-autenticacion';
import type { UsuarioAutenticado } from '../../nucleo/auth/modelos/usuario-autenticado';

@Component({
  standalone: true,
  imports: [SiTieneRolDirective],
  template: `<p *appSiTieneRol="roles" class="secreto">contenido</p>`,
})
class AnfitrionDirectiveComponent {
  roles: Array<UsuarioAutenticado['rol']> = ['AUDITOR_SST'];
}

describe('SiTieneRolDirective', () => {
  let fixture: ComponentFixture<AnfitrionDirectiveComponent>;
  let usuarioSignal: ReturnType<typeof signal<UsuarioAutenticado | null>>;

  const auditor: UsuarioAutenticado = {
    id: '1',
    nombre_completo: 'Ana',
    correo: 'ana@empresa.com',
    rol: 'AUDITOR_SST',
  };

  const consulta: UsuarioAutenticado = {
    ...auditor,
    rol: 'CONSULTA',
  };

  beforeEach(async () => {
    usuarioSignal = signal<UsuarioAutenticado | null>(null);

    await TestBed.configureTestingModule({
      imports: [AnfitrionDirectiveComponent],
      providers: [
        {
          provide: ServicioAutenticacion,
          useValue: {
            usuarioActual: usuarioSignal.asReadonly(),
            estaAutenticado: () => usuarioSignal() !== null,
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AnfitrionDirectiveComponent);
  });

  it('should renderizar el contenido si el rol esta permitido', () => {
    usuarioSignal.set(auditor);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.secreto'))).toBeTruthy();
  });

  it('should no renderizar si el rol no esta permitido', () => {
    usuarioSignal.set(consulta);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.secreto'))).toBeNull();
  });

  it('should actualizar la vista al cambiar la sesion', () => {
    usuarioSignal.set(consulta);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.secreto'))).toBeNull();

    usuarioSignal.set(auditor);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.secreto'))).toBeTruthy();

    usuarioSignal.set(consulta);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.secreto'))).toBeNull();
  });
});
