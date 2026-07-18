import { Routes } from '@angular/router';

import { PaginaLoginComponent } from './features/auth/paginas/pagina-login/pagina-login.component';
import { PaginaAccesoDenegadoComponent } from './features/auth/paginas/pagina-acceso-denegado/pagina-acceso-denegado.component';
import { PaginaEjemploSensibleComponent } from './features/auth/paginas/pagina-ejemplo-sensible/pagina-ejemplo-sensible.component';
import { ShellComponent } from './layout/shell/shell.component';
import { guardAutenticacion } from './nucleo/auth/guard-autenticacion';
import { guardRoles } from './nucleo/auth/guard-roles';
import { ROLES_AUDITORIA_SENSIBLE } from './nucleo/auth/constantes-roles';

export const rutasApp: Routes = [
  { path: 'login', component: PaginaLoginComponent },
  { path: 'acceso-denegado', component: PaginaAccesoDenegadoComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [guardAutenticacion],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/paginas/pagina-dashboard/pagina-dashboard.component').then(
            (modulo) => modulo.PaginaDashboardComponent
          ),
      },
      {
        path: 'ejemplo-sensible',
        component: PaginaEjemploSensibleComponent,
        canActivate: [guardRoles],
        data: { rolesPermitidos: [...ROLES_AUDITORIA_SENSIBLE] },
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
