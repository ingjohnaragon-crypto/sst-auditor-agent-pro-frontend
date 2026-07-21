import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  const dialogRef = { close: jest.fn() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        {
          provide: DIALOG_DATA,
          useValue: {
            titulo: 'Confirmación',
            mensaje: '¿Deseas continuar?',
            cerrable: true,
          },
        },
      ],
    });
    dialogRef.close.mockClear();
    fixture = TestBed.createComponent(ModalComponent);
    fixture.detectChanges();
  });

  it('should renderizar titulo y mensaje desde DIALOG_DATA', () => {
    const texto = (fixture.nativeElement as HTMLElement).textContent;
    expect(texto).toContain('Confirmación');
    expect(texto).toContain('¿Deseas continuar?');
    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector('[role="dialog"]')
        ?.getAttribute('aria-labelledby')
    ).toBe('modal-titulo');
  });

  it('should emitir alCerrar y cerrar DialogRef', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alCerrar, 'emit');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalled();
    expect(dialogRef.close).toHaveBeenCalled();
  });

  it('should ocultar el boton de cierre si cerrable es false', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: DialogRef, useValue: dialogRef },
        { provide: DIALOG_DATA, useValue: { titulo: 'Solo lectura', cerrable: false } },
      ],
    });
    const f = TestBed.createComponent(ModalComponent);
    f.detectChanges();
    expect((f.nativeElement as HTMLElement).querySelector('button')).toBeNull();
  });
});
