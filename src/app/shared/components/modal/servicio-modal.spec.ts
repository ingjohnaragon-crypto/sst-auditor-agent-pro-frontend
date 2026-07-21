import { TestBed } from '@angular/core/testing';
import { Dialog } from '@angular/cdk/dialog';
import { ModalComponent } from './modal.component';
import { ServicioModal } from './servicio-modal';

describe('ServicioModal', () => {
  it('should delegar el cierre a la referencia activa', () => {
    const referencia = { close: jest.fn(), closed: { subscribe: jest.fn() } };
    TestBed.configureTestingModule({ providers: [ServicioModal, { provide: Dialog, useValue: { open: jest.fn(() => referencia) } }] });
    const servicio = TestBed.inject(ServicioModal);
    servicio.abrir(ModalComponent);
    servicio.cerrar('aceptar');
    expect(referencia.close).toHaveBeenCalledWith('aceptar');
  });
});
