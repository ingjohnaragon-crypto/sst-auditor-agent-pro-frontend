import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Validators } from '@angular/forms';

import type { CampoFormulario } from '../campo-formulario.model';
import { FormularioDinamicoComponent } from './formulario-dinamico.component';

describe('FormularioDinamicoComponent', () => {
  let fixture: ComponentFixture<FormularioDinamicoComponent>;

  const campos: CampoFormulario[] = [
    {
      nombre: 'correo',
      tipo: 'texto',
      etiqueta: 'Correo',
      requerido: true,
      validadores: [Validators.email],
    },
    {
      nombre: 'rol',
      tipo: 'selector',
      etiqueta: 'Rol',
      requerido: true,
      opciones: [
        { valor: 'AUDITOR_SST', etiqueta: 'Auditor' },
        { valor: 'CONSULTA', etiqueta: 'Consulta' },
      ],
    },
    {
      nombre: 'activo',
      tipo: 'checkbox',
      etiqueta: 'Activo',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioDinamicoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(FormularioDinamicoComponent);
    fixture.componentRef.setInput('campos', campos);
    fixture.detectChanges();
  });

  it('should construir controles para los tres tipos', () => {
    expect(fixture.componentInstance.formulario.contains('correo')).toBe(true);
    expect(fixture.componentInstance.formulario.contains('rol')).toBe(true);
    expect(fixture.componentInstance.formulario.contains('activo')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Correo');
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('label[for="campo-correo"]')
    ).toBeTruthy();
  });

  it('should no emitir alEnviar si es invalido, marcar touched y mostrar error', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alEnviar, 'emit');
    fixture.componentInstance.enviar();
    fixture.detectChanges();
    expect(emitir).not.toHaveBeenCalled();
    expect(fixture.componentInstance.formulario.get('correo')?.touched).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('obligatorio');
  });

  it('should emitir valores cuando el formulario es valido', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alEnviar, 'emit');
    fixture.componentInstance.formulario.setValue({
      correo: 'ana@empresa.com',
      rol: 'AUDITOR_SST',
      activo: true,
    });
    fixture.componentInstance.enviar();
    expect(emitir).toHaveBeenCalledWith({
      correo: 'ana@empresa.com',
      rol: 'AUDITOR_SST',
      activo: true,
    });
  });

  it('should reconstruir el FormGroup al cambiar la referencia de campos', () => {
    const nuevos: CampoFormulario[] = [
      { nombre: 'nombre', tipo: 'texto', etiqueta: 'Nombre', requerido: true },
    ];
    fixture.componentRef.setInput('campos', nuevos);
    fixture.detectChanges();
    expect(fixture.componentInstance.formulario.contains('nombre')).toBe(true);
    expect(fixture.componentInstance.formulario.contains('correo')).toBe(false);
  });

  it('should usar leyenda sin for para radio', () => {
    fixture.componentRef.setInput('campos', [
      {
        nombre: 'nivel',
        tipo: 'radio',
        etiqueta: 'Nivel de riesgo',
        opciones: [
          { valor: 'alto', etiqueta: 'Alto' },
          { valor: 'bajo', etiqueta: 'Bajo' },
        ],
      },
    ] as CampoFormulario[]);
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('label[for="campo-nivel"]')
    ).toBeNull();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Nivel de riesgo');
  });

  it('should cablear aria-describedby en el control de texto', () => {
    const input = (fixture.nativeElement as HTMLElement).querySelector(
      '#campo-correo'
    ) as HTMLInputElement;
    expect(input.getAttribute('aria-describedby')).toBe('error-correo');
  });
});
