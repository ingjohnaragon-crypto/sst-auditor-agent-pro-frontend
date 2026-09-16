import { HttpErrorResponse } from "@angular/common/http";
import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";

import { ServicioModal } from "@app/shared";

import { ServicioAutenticacion } from "../../../../nucleo/auth/servicio-autenticacion";
import type {
  RolUsuario,
  UsuarioAutenticado,
} from "../../../../nucleo/auth/modelos/usuario-autenticado";
import type { RespuestaMatrizRiesgos } from "../../modelos";
import { ServicioEmpresasMatriz } from "../../servicios/servicio-empresas-matriz";
import { ServicioMatrizRiesgos } from "../../servicios/servicio-matriz-riesgos";
import { PaginaMatrizRiesgosComponent } from "./pagina-matriz-riesgos.component";

describe("PaginaMatrizRiesgosComponent", () => {
  let fixture: ComponentFixture<PaginaMatrizRiesgosComponent>;
  const usuario = signal<UsuarioAutenticado | null>(null);
  const empresasApi = { listar: jest.fn() };
  const modalApi = { abrir: jest.fn() };
  const matrizApi = {
    obtenerMatriz: jest.fn(),
    crearProceso: jest.fn(),
    actualizarProceso: jest.fn(),
    eliminarProceso: jest.fn(),
    crearPeligro: jest.fn(),
    actualizarPeligro: jest.fn(),
    eliminarPeligro: jest.fn(),
    guardarEvaluacion: jest.fn(),
    crearControl: jest.fn(),
    actualizarControl: jest.fn(),
    eliminarControl: jest.fn(),
  };

  const matriz: RespuestaMatrizRiesgos = {
    empresa_id: "empresa-1",
    procesos: [
      {
        proceso: {
          id: "proceso-1",
          empresa_id: "empresa-1",
          nombre: "Soldadura",
          es_rutinaria: true,
          zona_lugar: "Taller",
          fecha_creacion: "2026-01-01",
          fecha_actualizacion: "2026-01-01",
        },
        peligros: [
          {
            peligro: {
              id: "peligro-1",
              proceso_actividad_id: "proceso-1",
              clasificacion: "FISICO",
              descripcion: "Ruido continuo",
              efectos_posibles: "Hipoacusia",
              fecha_creacion: "2026-01-01",
              fecha_actualizacion: "2026-01-01",
            },
            evaluacion: {
              id: "evaluacion-1",
              peligro_id: "peligro-1",
              nivel_deficiencia: 0,
              nivel_exposicion: 4,
              nivel_consecuencia: 100,
              nivel_probabilidad: 0,
              nivel_riesgo: 0,
              interpretacion_nr: "IV",
              aceptabilidad: "ACEPTABLE",
              fecha_creacion: "2026-01-01",
              fecha_actualizacion: "2026-01-01",
            },
            controles: [
              {
                id: "control-1",
                evaluacion_riesgo_id: "evaluacion-1",
                tipo: "EPP",
                descripcion: "Protección auditiva",
                fecha_creacion: "2026-01-01",
                fecha_actualizacion: "2026-01-01",
              },
            ],
          },
        ],
      },
    ],
  };

  function establecerUsuario(rol: RolUsuario): void {
    usuario.set({
      id: "usuario-1",
      nombre_completo: "Ana Auditora",
      correo: "ana@empresa.com",
      rol,
    });
  }

  async function crearComponente(rol: RolUsuario = "AUDITOR_SST"): Promise<void> {
    establecerUsuario(rol);
    empresasApi.listar.mockReturnValue(
      of([{ id: "empresa-1", razon_social: "Acme SST", nit: "900123" }])
    );
    matrizApi.obtenerMatriz.mockReturnValue(of(matriz));
    await TestBed.configureTestingModule({
      imports: [PaginaMatrizRiesgosComponent],
      providers: [
        { provide: ServicioEmpresasMatriz, useValue: empresasApi },
        { provide: ServicioMatrizRiesgos, useValue: matrizApi },
        {
          provide: ServicioAutenticacion,
          useValue: { usuarioActual: usuario.asReadonly() },
        },
        { provide: ServicioModal, useValue: modalApi },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(PaginaMatrizRiesgosComponent);
    fixture.detectChanges();
  }

  beforeEach(() => {
    jest.clearAllMocks();
    matrizApi.crearProceso.mockReturnValue(of({}));
    matrizApi.actualizarProceso.mockReturnValue(of({}));
    matrizApi.eliminarProceso.mockReturnValue(of(undefined));
    matrizApi.crearPeligro.mockReturnValue(of({}));
    matrizApi.actualizarPeligro.mockReturnValue(of({}));
    matrizApi.eliminarPeligro.mockReturnValue(of(undefined));
    matrizApi.guardarEvaluacion.mockReturnValue(of({}));
    matrizApi.crearControl.mockReturnValue(of({}));
    matrizApi.actualizarControl.mockReturnValue(of({}));
    matrizApi.eliminarControl.mockReturnValue(of(undefined));
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it("should cargar y renderizar la matriz de la única empresa", async () => {
    await crearComponente();

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(empresasApi.listar).toHaveBeenCalled();
    expect(matrizApi.obtenerMatriz).toHaveBeenCalledWith("empresa-1");
    expect(texto).toContain("Soldadura");
    expect(texto).toContain("Ruido continuo");
    expect(texto).toContain("ACEPTABLE");
    expect(texto).toContain("EPP es el único control");
  });

  it("should ocultar acciones de escritura para CONSULTA", async () => {
    await crearComponente("CONSULTA");

    const texto = (fixture.nativeElement as HTMLElement).textContent ?? "";
    expect(fixture.componentInstance.puedeEscribir).toBe(false);
    expect(texto).toContain("Tu rol es de consulta");
    expect(texto).not.toContain("+ Agregar proceso");
    expect(texto).not.toContain("Editar proceso");
    expect(texto).not.toContain("+ Control");
  });

  it("should mostrar estado inicial cuando hay varias empresas", async () => {
    await crearComponente();
    empresasApi.listar.mockReturnValue(
      of([
        { id: "e-1", razon_social: "Uno", nit: "1" },
        { id: "e-2", razon_social: "Dos", nit: "2" },
      ])
    );
    fixture.componentInstance.empresaSeleccionadaId = "";
    fixture.componentInstance.cargarEmpresas();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Selecciona una empresa");
  });

  it("should mostrar mensaje de RespuestaError cuando falla la carga", async () => {
    await crearComponente();
    matrizApi.obtenerMatriz.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { codigo: "ACCESO_DENEGADO", mensaje: "Sin permiso", detalle: null },
          })
      )
    );

    fixture.componentInstance.cargarMatriz();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Sin permiso");
  });

  it("should reconocer los roles de escritura", async () => {
    await crearComponente("ADMINISTRADOR");
    expect(fixture.componentInstance.puedeEscribir).toBe(true);
    establecerUsuario("CONSULTA");
    expect(fixture.componentInstance.puedeEscribir).toBe(false);
  });

  it("should ejecutar altas y ediciones desde los formularios", async () => {
    await crearComponente();
    const proceso = matriz.procesos[0].proceso;
    const nodo = matriz.procesos[0].peligros[0];
    const peligro = nodo.peligro;
    const control = nodo.controles[0];

    modalApi.abrir.mockReturnValueOnce({
      closed: of({ nombre: "Corte", es_rutinaria: false, zona_lugar: null }),
    });
    fixture.componentInstance.abrirCrearProceso();
    expect(matrizApi.crearProceso).toHaveBeenCalledWith(
      "empresa-1",
      expect.objectContaining({ nombre: "Corte" })
    );

    modalApi.abrir.mockReturnValueOnce({
      closed: of({ nombre: "Soldadura fina", es_rutinaria: true }),
    });
    fixture.componentInstance.abrirEditarProceso(proceso);
    expect(matrizApi.actualizarProceso).toHaveBeenCalledWith(
      "proceso-1",
      expect.objectContaining({ nombre: "Soldadura fina" })
    );

    modalApi.abrir.mockReturnValueOnce({
      closed: of({
        clasificacion: "QUIMICO",
        descripcion: "Vapores",
        efectos_posibles: null,
      }),
    });
    fixture.componentInstance.abrirCrearPeligro(proceso);
    expect(matrizApi.crearPeligro).toHaveBeenCalledWith(
      "proceso-1",
      expect.objectContaining({ clasificacion: "QUIMICO" })
    );

    modalApi.abrir.mockReturnValueOnce({
      closed: of({
        clasificacion: "FISICO",
        descripcion: "Ruido actualizado",
        efectos_posibles: "Hipoacusia",
      }),
    });
    fixture.componentInstance.abrirEditarPeligro(peligro);
    expect(matrizApi.actualizarPeligro).toHaveBeenCalledWith(
      "peligro-1",
      expect.objectContaining({ descripcion: "Ruido actualizado" })
    );

    modalApi.abrir.mockReturnValueOnce({
      closed: of({
        nivel_deficiencia: 0,
        nivel_exposicion: 4,
        nivel_consecuencia: 100,
      }),
    });
    fixture.componentInstance.abrirEvaluacion(nodo);
    expect(matrizApi.guardarEvaluacion).toHaveBeenCalledWith("peligro-1", {
      nivel_deficiencia: 0,
      nivel_exposicion: 4,
      nivel_consecuencia: 100,
    });

    modalApi.abrir.mockReturnValueOnce({
      closed: of({ tipo: "INGENIERIA", descripcion: "Encerramiento" }),
    });
    fixture.componentInstance.abrirCrearControl(nodo);
    expect(matrizApi.crearControl).toHaveBeenCalledWith(
      "evaluacion-1",
      expect.objectContaining({ tipo: "INGENIERIA" })
    );

    modalApi.abrir.mockReturnValueOnce({
      closed: of({ tipo: "ADMINISTRATIVO", descripcion: "Rotación" }),
    });
    fixture.componentInstance.abrirEditarControl(control, 1);
    expect(matrizApi.actualizarControl).toHaveBeenCalledWith(
      "control-1",
      expect.objectContaining({ tipo: "ADMINISTRATIVO" })
    );
  });

  it("should ejecutar eliminaciones confirmadas y omitir las canceladas", async () => {
    await crearComponente();
    const proceso = matriz.procesos[0].proceso;
    const nodo = matriz.procesos[0].peligros[0];

    modalApi.abrir.mockReturnValueOnce({ closed: of(true) });
    fixture.componentInstance.confirmarEliminarProceso(proceso);
    expect(matrizApi.eliminarProceso).toHaveBeenCalledWith("proceso-1");

    modalApi.abrir.mockReturnValueOnce({ closed: of(true) });
    fixture.componentInstance.confirmarEliminarPeligro(nodo.peligro);
    expect(matrizApi.eliminarPeligro).toHaveBeenCalledWith("peligro-1");

    modalApi.abrir.mockReturnValueOnce({ closed: of(true) });
    fixture.componentInstance.confirmarEliminarControl(nodo.controles[0]);
    expect(matrizApi.eliminarControl).toHaveBeenCalledWith("control-1");

    matrizApi.eliminarControl.mockClear();
    modalApi.abrir.mockReturnValueOnce({ closed: of(false) });
    fixture.componentInstance.confirmarEliminarControl(nodo.controles[0]);
    expect(matrizApi.eliminarControl).not.toHaveBeenCalled();
  });

  it("should evitar mutaciones sin permiso y control sin evaluación", async () => {
    await crearComponente("CONSULTA");
    fixture.componentInstance.abrirCrearProceso();
    fixture.componentInstance.confirmarEliminarProceso(matriz.procesos[0].proceso);
    expect(modalApi.abrir).not.toHaveBeenCalled();

    establecerUsuario("AUDITOR_SST");
    const nodoSinEvaluacion = {
      ...matriz.procesos[0].peligros[0],
      evaluacion: null,
      controles: [],
    };
    fixture.componentInstance.abrirCrearControl(nodoSinEvaluacion);
    expect(fixture.componentInstance.mensajeError).toContain("Primero debes crear");
  });

  it("should cubrir etiquetas, niveles y error de red", async () => {
    await crearComponente();
    expect(fixture.componentInstance.etiquetaClasificacion("CONDICIONES_SEGURIDAD")).toBe(
      "condiciones seguridad"
    );
    expect(fixture.componentInstance.etiquetaAceptabilidad("NO_ACEPTABLE")).toBe("NO ACEPTABLE");
    const evaluacion = matriz.procesos[0].peligros[0].evaluacion!;
    for (const interpretacion of ["I", "II", "III", "IV"] as const) {
      expect(
        fixture.componentInstance.claseInterpretacion({
          ...evaluacion,
          interpretacion_nr: interpretacion,
        })
      ).toContain("border-");
    }
    expect(
      fixture.componentInstance.esEppUnico({
        ...matriz.procesos[0].peligros[0],
        controles: [],
      })
    ).toBe(false);

    matrizApi.obtenerMatriz.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    fixture.componentInstance.cargarMatriz();
    expect(fixture.componentInstance.mensajeError).toContain("conectar");
  });
});
