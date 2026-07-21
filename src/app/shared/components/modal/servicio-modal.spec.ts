import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { firstValueFrom } from 'rxjs';

import { ModalComponent } from './modal.component';
import { ServicioModal } from './servicio-modal';

describe('ServicioModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DialogModule, ModalComponent],
      providers: [ServicioModal, provideNoopAnimations()],
    });
  });

  afterEach(() => {
    document.querySelectorAll('.cdk-overlay-container').forEach((n) => n.remove());
  });

  it('should montar ModalComponent con DIALOG_DATA', () => {
    const servicio = TestBed.inject(ServicioModal);
    const appRef = TestBed.inject(ApplicationRef);
    servicio.abrir(ModalComponent, {
      data: { titulo: 'Aviso', mensaje: 'Contenido del modal', cerrable: true },
    });
    appRef.tick();

    const modal = document.querySelector('app-modal');
    expect(modal?.textContent).toContain('Aviso');
    expect(modal?.textContent).toContain('Contenido del modal');
    servicio.cerrar();
    appRef.tick();
  });

  it('should cerrar el dialogo y devolver el foco al disparador', async () => {
    const disparador = document.createElement('button');
    disparador.textContent = 'Abrir';
    document.body.appendChild(disparador);
    disparador.focus();

    const servicio = TestBed.inject(ServicioModal);
    const appRef = TestBed.inject(ApplicationRef);
    const ref = servicio.abrir(ModalComponent, {
      data: { titulo: 'Cierre', mensaje: 'Cerrar programaticamente' },
      // CDK Dialog restaura el foco al elemento activo al abrir.
    });
    appRef.tick();

    expect(document.querySelector('app-modal')).toBeTruthy();

    const cerrado = firstValueFrom(ref.closed);
    ref.close();
    await cerrado;
    appRef.tick();

    expect(document.querySelector('app-modal')).toBeNull();
    expect(document.activeElement).toBe(disparador);
    disparador.remove();
  });

  it('should abrir con disableClose en false para permitir Esc', () => {
    const open = jest.fn(() => ({
      close: jest.fn(),
      closed: { subscribe: jest.fn() },
    }));
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ServicioModal, { provide: Dialog, useValue: { open } }],
    });
    const servicio = TestBed.inject(ServicioModal);
    servicio.abrir(ModalComponent, { data: { titulo: 'Esc' } });
    expect(open).toHaveBeenCalledWith(
      ModalComponent,
      expect.objectContaining({ disableClose: false })
    );
  });

  it('should cerrar el dialogo previo al abrir uno nuevo', () => {
    const servicio = TestBed.inject(ServicioModal);
    const appRef = TestBed.inject(ApplicationRef);
    const primero = servicio.abrir(ModalComponent, { data: { titulo: 'Uno', mensaje: 'A' } });
    appRef.tick();
    const spyCerrar = jest.spyOn(primero, 'close');

    servicio.abrir(ModalComponent, { data: { titulo: 'Dos', mensaje: 'B' } });
    appRef.tick();

    expect(spyCerrar).toHaveBeenCalled();
    const modal = document.querySelector('app-modal');
    expect(modal?.textContent).toContain('Dos');
    servicio.cerrar();
    appRef.tick();
  });

  it('should delegar el cierre a la referencia activa', () => {
    const referencia = { close: jest.fn(), closed: { subscribe: jest.fn() } };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        ServicioModal,
        { provide: Dialog, useValue: { open: jest.fn(() => referencia) } },
      ],
    });
    const servicio = TestBed.inject(ServicioModal);
    servicio.abrir(ModalComponent);
    servicio.cerrar('aceptar');
    expect(referencia.close).toHaveBeenCalledWith('aceptar');
  });
});
