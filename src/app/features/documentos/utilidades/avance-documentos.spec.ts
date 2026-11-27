import {
  calcularAvanceDocumentos,
  etiquetarEstado,
  etiquetarFase,
} from './avance-documentos';
import type { DocumentoEmpresa } from '../modelos';

function doc(estado: DocumentoEmpresa['estado']): DocumentoEmpresa {
  return {
    id: null,
    empresa_id: 'e1',
    tipo_id: 't1',
    tipo_codigo: 'X',
    tipo_nombre: 'X',
    fase: 'PLANEAR',
    estado,
    fecha_carga: null,
    nombre_original: null,
    tipo_mime: null,
    tamano_bytes: null,
    usuario_nombre: null,
  };
}

describe('calcularAvanceDocumentos', () => {
  it('should devolver 0 cuando no hay documentos', () => {
    expect(calcularAvanceDocumentos([])).toBe(0);
  });

  it('should contar solo no pendientes', () => {
    const lista = [
      doc('PENDIENTE'),
      doc('PENDIENTE'),
      doc('CARGADO'),
      doc('REVISADO'),
      doc('PENDIENTE'),
      doc('PENDIENTE'),
      doc('PENDIENTE'),
      doc('PENDIENTE'),
      doc('PENDIENTE'),
      doc('PENDIENTE'),
    ];
    expect(calcularAvanceDocumentos(lista)).toBe(20);
  });

  it('should devolver 100 cuando ninguno está pendiente', () => {
    expect(calcularAvanceDocumentos([doc('CARGADO'), doc('REVISADO')])).toBe(100);
  });
});

describe('etiquetarFase', () => {
  it('should etiquetar las cuatro fases PHVA', () => {
    expect(etiquetarFase('PLANEAR')).toBe('Planear');
    expect(etiquetarFase('HACER')).toBe('Hacer');
    expect(etiquetarFase('VERIFICAR')).toBe('Verificar');
    expect(etiquetarFase('ACTUAR')).toBe('Actuar');
  });

  it('should devolver el valor crudo when fase desconocida', () => {
    expect(etiquetarFase('OTRA')).toBe('OTRA');
  });
});

describe('etiquetarEstado', () => {
  it('should etiquetar estados conocidos', () => {
    expect(etiquetarEstado('PENDIENTE')).toBe('Pendiente');
    expect(etiquetarEstado('CARGADO')).toBe('Cargado');
    expect(etiquetarEstado('REVISADO')).toBe('Revisado');
  });

  it('should devolver el valor crudo when estado desconocido', () => {
    expect(etiquetarEstado('ARCHIVADO')).toBe('ARCHIVADO');
  });
});
