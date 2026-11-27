import { ComponentFixture, TestBed } from '@angular/core/testing';

import type { DocumentoVista } from '../../modelos';
import { TarjetaDocumentoComponent } from './tarjeta-documento.component';

describe('TarjetaDocumentoComponent', () => {
  let fixture: ComponentFixture<TarjetaDocumentoComponent>;
  let componente: TarjetaDocumentoComponent;

  const vistaBase: DocumentoVista = {
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
    componente.vista = {
      ...vistaBase,
      documento: { ...vistaBase.documento },
    };
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
      ...vistaBase,
      documento: { ...vistaBase.documento, estado: 'CARGADO', nombre_original: 'a.pdf' },
    };
    fixture.detectChanges();
    componente.marcarRevisado();
    expect(spy).toHaveBeenCalledWith('t1');
  });

  it('should abrir selector solo si puede escribir y no está subiendo', () => {
    const click = jest.fn();
    componente.inputArchivo = {
      nativeElement: { click },
    } as unknown as typeof componente.inputArchivo;

    componente.puedeEscribir = false;
    componente.abrirSelector();
    expect(click).not.toHaveBeenCalled();

    componente.puedeEscribir = true;
    componente.subiendoTipoId = 't1';
    componente.abrirSelector();
    expect(click).not.toHaveBeenCalled();

    componente.subiendoTipoId = null;
    componente.abrirSelector();
    expect(click).toHaveBeenCalled();
  });

  it('should emitir alCargar when el input recibe un archivo', () => {
    const spy = jest.spyOn(componente.alCargar, 'emit');
    const archivo = new File(['%PDF'], 'a.pdf', { type: 'application/pdf' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', {
      value: [archivo],
    });
    componente.alCambiarArchivo({ target: input } as unknown as Event);
    expect(spy).toHaveBeenCalledWith({ tipoId: 't1', archivo });

    spy.mockClear();
    componente.alCambiarArchivo({ target: {} } as Event);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emitir descargar solo si no está pendiente', () => {
    const spy = jest.spyOn(componente.alDescargar, 'emit');
    componente.descargar();
    expect(spy).not.toHaveBeenCalled();

    componente.vista = {
      ...vistaBase,
      documento: { ...vistaBase.documento, estado: 'REVISADO', nombre_original: 'a.pdf' },
    };
    componente.descargar();
    expect(spy).toHaveBeenCalledWith('t1');
  });

  it('should devolver clases de estado por cada valor', () => {
    componente.vista = {
      ...vistaBase,
      documento: { ...vistaBase.documento, estado: 'PENDIENTE' },
    };
    expect(componente.claseEstado()).toContain('amber');

    componente.vista = {
      ...vistaBase,
      documento: { ...vistaBase.documento, estado: 'CARGADO' },
    };
    expect(componente.claseEstado()).toContain('sky');

    componente.vista = {
      ...vistaBase,
      documento: { ...vistaBase.documento, estado: 'REVISADO' },
    };
    expect(componente.claseEstado()).toContain('emerald');

    componente.vista = {
      ...vistaBase,
      documento: {
        ...vistaBase.documento,
        estado: 'OTRO' as DocumentoVista['documento']['estado'],
      },
    };
    expect(componente.claseEstado()).toContain('slate');
  });
});
