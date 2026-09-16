import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";

import { environment } from "../../../../environments/environment";
import type { EmpresaMatriz } from "../modelos";

@Injectable({ providedIn: "root" })
export class ServicioEmpresasMatriz {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/empresas`;

  listar(): Observable<EmpresaMatriz[]> {
    return this.http.get<EmpresaMatriz[]>(this.url);
  }
}
