import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

import { AlertaComponent, BotonComponent } from "@app/shared";

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
}

@Component({
  selector: "app-dialogo-confirmacion",
  standalone: true,
  imports: [AlertaComponent, BotonComponent],
  templateUrl: "./dialogo-confirmacion.component.html",
  styleUrls: ["./dialogo-confirmacion.component.css"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogoConfirmacionComponent {
  readonly datos = inject<DatosConfirmacion>(DIALOG_DATA);
  private readonly dialogo = inject(DialogRef<boolean, DialogoConfirmacionComponent>);

  responder(confirmado: boolean): void {
    this.dialogo.close(confirmado);
  }
}
