import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DocumentoVista } from '../../modelos';
import { ListaDocumentosFaseComponent } from './lista-documentos-fase.component';

describe('ListaDocumentosFaseComponent', () => {
  let fixture: ComponentFixture<ListaDocumentosFaseComponent>;
  let componente: ListaDocumentosFaseComponent;

  const vista: DocumentoVista = {
    documento: {
      id: null,
      empresa_id: 'e1',
      tipo_id: 't1',
      tipo_codigo: 'POLITICA_SST',
      tipo_nombre: 'Política',
      fase: 'PLANEAR',
      estado: 'PENDIENTE',
      fecha_carga: null,
      nombre_original: null,
      tipo_mime: null,
      tamano_bytes: null,
      usuario_nombre: null,
    },
    obligatorio: true,
    descripcion: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaDocumentosFaseComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ListaDocumentosFaseComponent);
    componente = fixture.componentInstance;
  });

  it('should mostrar vacío when no hay vistas', () => {
    componente.vistas = [];
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay documentos en esta fase'
    );
  });

  it('should renderizar tarjetas when hay vistas', () => {
    componente.vistas = [vista];
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Política');
    expect(componente.trackVista(0, vista)).toBe('t1');
  });
});
