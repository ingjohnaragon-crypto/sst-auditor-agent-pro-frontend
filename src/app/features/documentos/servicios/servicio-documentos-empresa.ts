import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { codificarIdRuta } from '../../archivos/utilidades/codificar-id-ruta';
import type { DocumentoEmpresa, TipoDocumentoSst } from '../modelos';

@Injectable({ providedIn: 'root' })
export class ServicioDocumentosEmpresa {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listarCatalogo(): Observable<TipoDocumentoSst[]> {
    return this.http.get<TipoDocumentoSst[]>(`${this.baseUrl}/catalogo-documentos`);
  }

  listarPorEmpresa(empresaId: string): Observable<DocumentoEmpresa[]> {
    return this.http.get<DocumentoEmpresa[]>(this.urlEmpresa(empresaId));
  }

  cargar(empresaId: string, tipoId: string, archivo: File): Observable<DocumentoEmpresa> {
    const datos = new FormData();
    datos.append('archivo', archivo, archivo.name);
    return this.http.post<DocumentoEmpresa>(this.urlArchivo(empresaId, tipoId), datos);
  }

  descargar(empresaId: string, tipoId: string): Observable<Blob> {
    return this.http.get(this.urlArchivo(empresaId, tipoId), {
      responseType: 'blob',
    });
  }

  marcarRevisado(empresaId: string, tipoId: string): Observable<DocumentoEmpresa> {
    return this.http.patch<DocumentoEmpresa>(this.urlTipo(empresaId, tipoId), {
      estado: 'REVISADO',
    });
  }

  private urlEmpresa(empresaId: string): string {
    return `${this.baseUrl}/empresas/${codificarIdRuta(empresaId)}/documentos`;
  }

  private urlTipo(empresaId: string, tipoId: string): string {
    return `${this.urlEmpresa(empresaId)}/${codificarIdRuta(tipoId)}`;
  }

  private urlArchivo(empresaId: string, tipoId: string): string {
    return `${this.urlTipo(empresaId, tipoId)}/archivo`;
  }
}
