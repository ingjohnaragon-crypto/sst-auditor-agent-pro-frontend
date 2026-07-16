import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PaginaAccesoDenegadoComponent } from './pagina-acceso-denegado.component';

describe('PaginaAccesoDenegadoComponent', () => {
  it('should create', () => {
    TestBed.configureTestingModule({
      imports: [PaginaAccesoDenegadoComponent],
      providers: [provideRouter([])],
    });
    const fixture = TestBed.createComponent(PaginaAccesoDenegadoComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
