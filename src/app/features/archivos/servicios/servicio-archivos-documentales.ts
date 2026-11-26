import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import type { ArchivoDocumental } from '../modelos';
import { codificarIdRuta } from '../utilidades/codificar-id-ruta';

@Injectable({ providedIn: 'root' })
export class ServicioArchivosDocumentales {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listar(empresaId: string): Observable<ArchivoDocumental[]> {
    return this.http.get<ArchivoDocumental[]>(this.urlEmpresa(empresaId));
  }

  cargar(empresaId: string, archivo: File): Observable<ArchivoDocumental> {
    const datos = new FormData();
    datos.append('archivo', archivo, archivo.name);
    return this.http.post<ArchivoDocumental>(this.urlEmpresa(empresaId), datos);
  }

  descargar(empresaId: string, archivoId: string): Observable<Blob> {
    return this.http.get(this.urlArchivo(empresaId, archivoId), {
      responseType: 'blob',
    });
  }

  eliminar(empresaId: string, archivoId: string): Observable<void> {
    return this.http.delete<void>(this.urlArchivo(empresaId, archivoId));
  }

  private urlEmpresa(empresaId: string): string {
    return `${this.baseUrl}/empresas/${codificarIdRuta(empresaId)}/archivos`;
  }

  private urlArchivo(empresaId: string, archivoId: string): string {
    return `${this.urlEmpresa(empresaId)}/${codificarIdRuta(archivoId)}`;
  }
}
