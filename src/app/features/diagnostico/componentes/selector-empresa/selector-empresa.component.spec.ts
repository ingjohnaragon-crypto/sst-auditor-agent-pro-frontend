import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectorEmpresaComponent } from './selector-empresa.component';

describe('SelectorEmpresaComponent', () => {
  let fixture: ComponentFixture<SelectorEmpresaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectorEmpresaComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(SelectorEmpresaComponent);
    fixture.componentInstance.empresas = [{ id: 'e-1', razon_social: 'Acme', nit: '900' }];
    fixture.detectChanges();
  });

  it('should emitir la empresa seleccionada', () => {
    const emitir = jest.fn();
    fixture.componentInstance.alSeleccionar.subscribe(emitir);
    const select = (fixture.nativeElement as HTMLElement).querySelector('select') as HTMLSelectElement;
    select.value = 'e-1';
    select.dispatchEvent(new Event('change'));
    expect(emitir).toHaveBeenCalledWith('e-1');
  });
});
