import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";

import { environment } from "../../../../environments/environment";
import type {
  RespuestaMatrizRiesgos,
  SolicitudControl,
  SolicitudEvaluacion,
  SolicitudPeligro,
  SolicitudProcesoActividad,
} from "../modelos";
import { ServicioMatrizRiesgos } from "./servicio-matriz-riesgos";

describe("ServicioMatrizRiesgos", () => {
  let servicio: ServicioMatrizRiesgos;
  let http: HttpTestingController;
  const base = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicioMatrizRiesgos],
    });
    servicio = TestBed.inject(ServicioMatrizRiesgos);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it("should obtener la matriz agregada y codificar el id", () => {
    const matriz: RespuestaMatrizRiesgos = { empresa_id: "empresa/1", procesos: [] };
    servicio.obtenerMatriz("empresa/1").subscribe((respuesta) => expect(respuesta).toBe(matriz));

    const solicitud = http.expectOne(`${base}/empresas/empresa%2F1/matriz-riesgos`);
    expect(solicitud.request.method).toBe("GET");
    solicitud.flush(matriz);
  });

  it("should crear, actualizar y eliminar un proceso", () => {
    const body: SolicitudProcesoActividad = {
      nombre: "Soldadura",
      es_rutinaria: true,
      zona_lugar: "Taller",
    };
    servicio.crearProceso("e-1", body).subscribe();
    let solicitud = http.expectOne(`${base}/empresas/e-1/procesos-actividades`);
    expect(solicitud.request.method).toBe("POST");
    expect(solicitud.request.body).toEqual(body);
    solicitud.flush({});

    servicio.actualizarProceso("p-1", { nombre: "Corte" }).subscribe();
    solicitud = http.expectOne(`${base}/procesos-actividades/p-1`);
    expect(solicitud.request.method).toBe("PATCH");
    solicitud.flush({});

    servicio.eliminarProceso("p-1").subscribe();
    solicitud = http.expectOne(`${base}/procesos-actividades/p-1`);
    expect(solicitud.request.method).toBe("DELETE");
    solicitud.flush(null, { status: 204, statusText: "No Content" });
  });

  it("should crear, actualizar y eliminar un peligro", () => {
    const body: SolicitudPeligro = {
      clasificacion: "FISICO",
      descripcion: "Ruido",
      efectos_posibles: null,
    };
    servicio.crearPeligro("p-1", body).subscribe();
    let solicitud = http.expectOne(`${base}/procesos-actividades/p-1/peligros`);
    expect(solicitud.request.body).toEqual(body);
    solicitud.flush({});

    servicio.actualizarPeligro("r-1", { descripcion: "Ruido continuo" }).subscribe();
    solicitud = http.expectOne(`${base}/peligros/r-1`);
    expect(solicitud.request.method).toBe("PATCH");
    solicitud.flush({});

    servicio.eliminarPeligro("r-1").subscribe();
    solicitud = http.expectOne(`${base}/peligros/r-1`);
    solicitud.flush(null, { status: 204, statusText: "No Content" });
  });

  it("should enviar solamente ND NE y NC al guardar evaluación", () => {
    const body: SolicitudEvaluacion = {
      nivel_deficiencia: 0,
      nivel_exposicion: 4,
      nivel_consecuencia: 100,
    };
    servicio.guardarEvaluacion("r-1", body).subscribe();

    const solicitud = http.expectOne(`${base}/peligros/r-1/evaluacion`);
    expect(solicitud.request.method).toBe("PUT");
    expect(solicitud.request.body).toEqual(body);
    expect(solicitud.request.body.nivel_riesgo).toBeUndefined();
    solicitud.flush({});
  });

  it("should gestionar CRUD de controles", () => {
    const body: SolicitudControl = { tipo: "INGENIERIA", descripcion: "Encerramiento" };
    servicio.crearControl("ev-1", body).subscribe();
    let solicitud = http.expectOne(`${base}/evaluaciones-riesgo/ev-1/controles`);
    expect(solicitud.request.method).toBe("POST");
    solicitud.flush({});

    servicio.actualizarControl("c-1", { tipo: "EPP" }).subscribe();
    solicitud = http.expectOne(`${base}/controles-riesgo/c-1`);
    expect(solicitud.request.method).toBe("PATCH");
    solicitud.flush({});

    servicio.eliminarControl("c-1").subscribe();
    solicitud = http.expectOne(`${base}/controles-riesgo/c-1`);
    expect(solicitud.request.method).toBe("DELETE");
    solicitud.flush(null, { status: 204, statusText: "No Content" });
  });

  it("should propagar errores de negocio sin reemplazarlos", () => {
    let codigo = "";
    servicio
      .guardarEvaluacion("r-1", {
        nivel_deficiencia: 2,
        nivel_exposicion: 2,
        nivel_consecuencia: 10,
      })
      .subscribe({ error: (error) => (codigo = error.error.codigo) });

    http
      .expectOne(`${base}/peligros/r-1/evaluacion`)
      .flush(
        { codigo: "VALOR_GTC_INVALIDO", mensaje: "ND inválido", detalle: null },
        { status: 422, statusText: "Unprocessable Entity" }
      );
    expect(codigo).toBe("VALOR_GTC_INVALIDO");
  });
});
