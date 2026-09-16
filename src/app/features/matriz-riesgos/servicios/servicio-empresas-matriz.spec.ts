import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import type { EmpresaMatriz } from "../modelos";
import { ServicioEmpresasMatriz } from "./servicio-empresas-matriz";

describe("ServicioEmpresasMatriz", () => {
  let servicio: ServicioEmpresasMatriz;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioEmpresasMatriz],
    });
    servicio = TestBed.inject(ServicioEmpresasMatriz);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("should listar empresas desde la API", () => {
    const empresas: EmpresaMatriz[] = [{ id: "e-1", razon_social: "Acme", nit: "900" }];
    servicio.listar().subscribe((respuesta) => expect(respuesta).toEqual(empresas));

    const solicitud = http.expectOne(`${environment.apiBaseUrl}/empresas`);
    expect(solicitud.request.method).toBe("GET");
    solicitud.flush(empresas);
  });
});
