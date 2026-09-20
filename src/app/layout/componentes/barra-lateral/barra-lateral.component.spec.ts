import { NgZone } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";

import { BarraLateralComponent } from "./barra-lateral.component";

describe("BarraLateralComponent", () => {
  let fixture: ComponentFixture<BarraLateralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralComponent],
      providers: [
        provideRouter([
          { path: "dashboard", children: [] },
          { path: "matriz-riesgos", children: [] },
          { path: "diagnostico", children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BarraLateralComponent);
    fixture.detectChanges();
  });

  it("should mostrar el acceso a Inicio", () => {
    const inicio = (fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Inicio"]');

    expect(inicio?.getAttribute("href")).toBe("/dashboard");
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Inicio");
  });

  it("should resaltar el enlace activo al navegar al dashboard", async () => {
    await TestBed.inject(NgZone).run(() => TestBed.inject(Router).navigate(["/dashboard"]));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const inicio = (fixture.nativeElement as HTMLElement).querySelector('a[aria-label="Inicio"]');

    expect(inicio?.classList.contains("bg-indigo-600")).toBe(true);
    expect(inicio?.classList.contains("text-white")).toBe(true);
  });

  it("should mostrar el acceso a diagnostico", () => {
    const diagnostico = (fixture.nativeElement as HTMLElement).querySelector(
      'a[aria-label="Diagnóstico"]'
    );

    expect(diagnostico?.getAttribute("href")).toBe("/diagnostico");
    expect(diagnostico?.textContent).toContain("Diagnóstico");
  });

  it("should mostrar el acceso a la matriz de riesgos", () => {
    const matriz = (fixture.nativeElement as HTMLElement).querySelector(
      'a[aria-label="Matriz de riesgos"]'
    );

    expect(matriz?.getAttribute("href")).toBe("/matriz-riesgos");
    expect(matriz?.textContent).toContain("Matriz de riesgos");
  });

  it("should resaltar la matriz al navegar a su ruta", async () => {
    await TestBed.inject(NgZone).run(() => TestBed.inject(Router).navigate(["/matriz-riesgos"]));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const matriz = (fixture.nativeElement as HTMLElement).querySelector(
      'a[aria-label="Matriz de riesgos"]'
    );
    expect(matriz?.classList.contains("bg-indigo-600")).toBe(true);
    expect(matriz?.classList.contains("text-white")).toBe(true);
  });
});
