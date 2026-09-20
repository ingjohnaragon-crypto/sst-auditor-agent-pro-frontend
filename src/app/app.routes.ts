import { Routes } from "@angular/router";

import { PaginaLoginComponent } from "./features/auth/paginas/pagina-login/pagina-login.component";
import { PaginaAccesoDenegadoComponent } from "./features/auth/paginas/pagina-acceso-denegado/pagina-acceso-denegado.component";
import { PaginaEjemploSensibleComponent } from "./features/auth/paginas/pagina-ejemplo-sensible/pagina-ejemplo-sensible.component";
import { ShellComponent } from "./layout/shell/shell.component";
import { guardAutenticacion } from "./nucleo/auth/guard-autenticacion";
import { guardRoles } from "./nucleo/auth/guard-roles";
import { ROLES_AUDITORIA_SENSIBLE } from "./nucleo/auth/constantes-roles";

export const rutasApp: Routes = [
  { path: "login", component: PaginaLoginComponent },
  { path: "acceso-denegado", component: PaginaAccesoDenegadoComponent },
  {
    path: "",
    component: ShellComponent,
    canActivate: [guardAutenticacion],
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component").then(
            (modulo) => modulo.PaginaDashboardComponent
          ),
      },
      {
        path: "matriz-riesgos",
        loadComponent: () =>
          import("./features/matriz-riesgos/paginas/pagina-matriz-riesgos/pagina-matriz-riesgos.component").then(
            (modulo) => modulo.PaginaMatrizRiesgosComponent
          ),
      },
      {
        path: "diagnostico",
        children: [
          {
            path: "",
            loadComponent: () =>
              import("./features/diagnostico/paginas/pagina-diagnostico/pagina-diagnostico.component").then(
                (modulo) => modulo.PaginaDiagnosticoComponent
              ),
          },
          {
            path: "historico",
            loadComponent: () =>
              import("./features/diagnostico/paginas/pagina-historico-diagnostico/pagina-historico-diagnostico.component").then(
                (modulo) => modulo.PaginaHistoricoDiagnosticoComponent
              ),
          },
          {
            path: ":id",
            loadComponent: () =>
              import("./features/diagnostico/paginas/pagina-detalle-diagnostico/pagina-detalle-diagnostico.component").then(
                (modulo) => modulo.PaginaDetalleDiagnosticoComponent
              ),
          },
        ],
      },
      {
        path: "ejemplo-sensible",
        component: PaginaEjemploSensibleComponent,
        canActivate: [guardRoles],
        data: { rolesPermitidos: [...ROLES_AUDITORIA_SENSIBLE] },
      },
      // Wildcard dentro del shell: el guard evalúa la URL original, por lo que
      // un anónimo conserva returnUrl con la ruta que pidió.
      { path: "**", redirectTo: "dashboard" },
    ],
  },
];
