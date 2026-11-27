import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DocumentoVista } from '../../modelos';
import { TarjetaDocumentoComponent } from './tarjeta-documento.component';

describe('TarjetaDocumentoComponent', () => {
  let fixture: ComponentFixture<TarjetaDocumentoComponent>;
  let componente: TarjetaDocumentoComponent;

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
    descripcion: 'desc',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TarjetaDocumentoComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(TarjetaDocumentoComponent);
    componente = fixture.componentInstance;
    componente.vista = vista;
    componente.puedeEscribir = true;
    fixture.detectChanges();
  });

  it('should mostrar botón cargar y no descargar when pendiente', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect(root.textContent).toContain('Cargar');
    expect(root.textContent).not.toContain('Descargar');
    expect(root.textContent).toContain('Obligatorio');
  });

  it('should emitir marcar revisado solo cuando está cargado', () => {
    const spy = jest.spyOn(componente.alMarcarRevisado, 'emit');
    componente.marcarRevisado();
    expect(spy).not.toHaveBeenCalled();

    componente.vista = {
      ...vista,
      documento: { ...vista.documento, estado: 'CARGADO', nombre_original: 'a.pdf' },
    };
    fixture.detectChanges();
    componente.marcarRevisado();
    expect(spy).toHaveBeenCalledWith('t1');
  });
});
