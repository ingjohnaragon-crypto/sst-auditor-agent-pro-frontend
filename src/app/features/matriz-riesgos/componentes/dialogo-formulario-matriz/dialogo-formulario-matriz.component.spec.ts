import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

import {
  DatosFormularioMatriz,
  DialogoFormularioMatrizComponent,
} from "./dialogo-formulario-matriz.component";

describe("DialogoFormularioMatrizComponent", () => {
  let fixture: ComponentFixture<DialogoFormularioMatrizComponent>;
  const cerrar = jest.fn();

  async function crear(datos: DatosFormularioMatriz): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DialogoFormularioMatrizComponent],
      providers: [
        { provide: DIALOG_DATA, useValue: datos },
        { provide: DialogRef, useValue: { close: cerrar } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(DialogoFormularioMatrizComponent);
    fixture.detectChanges();
  }

  beforeEach(() => cerrar.mockClear());

  it("should emitir solamente ND NE y NC al guardar evaluación", async () => {
    await crear({
      tipo: "evaluacion",
      titulo: "Evaluar",
      valores: {
        nivel_deficiencia: 0,
        nivel_exposicion: 4,
        nivel_consecuencia: 100,
        nivel_riesgo: 999,
      },
    });

    fixture.componentInstance.guardar();

    expect(cerrar).toHaveBeenCalledWith({
      nivel_deficiencia: 0,
      nivel_exposicion: 4,
      nivel_consecuencia: 100,
    });
  });

  it("should advertir cuando EPP sería el único control", async () => {
    await crear({
      tipo: "control",
      titulo: "Control",
      cantidadControles: 0,
      valores: { tipo: "EPP", descripcion: "Casco" },
    });

    expect(fixture.componentInstance.advertirEppUnico).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      "El EPP no debe ser la única medida"
    );
  });

  it("should impedir guardar un proceso sin nombre", async () => {
    await crear({ tipo: "proceso", titulo: "Proceso" });

    fixture.componentInstance.guardar();

    expect(cerrar).not.toHaveBeenCalled();
    expect(fixture.componentInstance.formulario.invalid).toBe(true);
  });

  it("should cerrar sin resultado al cancelar", async () => {
    await crear({ tipo: "peligro", titulo: "Peligro" });

    fixture.componentInstance.cancelar();

    expect(cerrar).toHaveBeenCalledWith(undefined);
  });

  it("should normalizar y guardar proceso y peligro", async () => {
    await crear({
      tipo: "proceso",
      titulo: "Proceso",
      valores: {
        nombre: "  Soldadura  ",
        es_rutinaria: true,
        zona_lugar: "  Taller  ",
      },
    });
    fixture.componentInstance.guardar();
    expect(cerrar).toHaveBeenLastCalledWith({
      nombre: "Soldadura",
      es_rutinaria: true,
      zona_lugar: "Taller",
    });

    cerrar.mockClear();
    await crear({
      tipo: "peligro",
      titulo: "Peligro",
      valores: {
        clasificacion: "QUIMICO",
        descripcion: "  Vapores  ",
        efectos_posibles: "",
      },
    });
    fixture.componentInstance.guardar();
    expect(cerrar).toHaveBeenCalledWith({
      clasificacion: "QUIMICO",
      descripcion: "Vapores",
      efectos_posibles: null,
    });
  });

  it("should guardar control sin advertencia cuando ya existen otros controles", async () => {
    await crear({
      tipo: "control",
      titulo: "Control",
      cantidadControles: 2,
      valores: { tipo: "EPP", descripcion: "  Respirador  " },
    });

    expect(fixture.componentInstance.advertirEppUnico).toBe(false);
    fixture.componentInstance.guardar();
    expect(cerrar).toHaveBeenCalledWith({
      tipo: "EPP",
      descripcion: "Respirador",
    });
  });
});
