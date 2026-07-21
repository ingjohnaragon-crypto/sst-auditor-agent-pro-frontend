import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent', () => {
  let fixture: ComponentFixture<ModalComponent>;
  beforeEach(() => { fixture = TestBed.createComponent(ModalComponent); fixture.componentInstance.titulo = 'Confirmación'; fixture.detectChanges(); });

  it('should renderizar su titulo y permitir cierre', () => {
    const emitir = jest.spyOn(fixture.componentInstance.alCerrar, 'emit');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Confirmación');
    (fixture.nativeElement as HTMLElement).querySelector('button')?.click();
    expect(emitir).toHaveBeenCalled();
  });
});
