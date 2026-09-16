import { TestBed } from "@angular/core/testing";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

import { DialogoConfirmacionComponent } from "./dialogo-confirmacion.component";

describe("DialogoConfirmacionComponent", () => {
  it("should devolver la decisión elegida", async () => {
    const cerrar = jest.fn();
    await TestBed.configureTestingModule({
      imports: [DialogoConfirmacionComponent],
      providers: [
        {
          provide: DIALOG_DATA,
          useValue: { titulo: "Eliminar", mensaje: "Esta acción es irreversible." },
        },
        { provide: DialogRef, useValue: { close: cerrar } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(DialogoConfirmacionComponent);
    fixture.detectChanges();

    fixture.componentInstance.responder(true);

    expect(cerrar).toHaveBeenCalledWith(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("irreversible");
  });
});
