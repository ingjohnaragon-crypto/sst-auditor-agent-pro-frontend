import { Routes } from '@angular/router';

import { RootComponent } from './root.component';
import { PaginaLoginComponent } from './features/auth/paginas/pagina-login.component';
import { PaginaAccesoDenegadoComponent } from './features/auth/paginas/pagina-acceso-denegado.component';
import { PaginaEjemploSensibleComponent } from './features/auth/paginas/pagina-ejemplo-sensible.component';
import { guardAutenticacion } from './nucleo/auth/guard-autenticacion';
import { guardRoles } from './nucleo/auth/guard-roles';
import { ROLES_AUDITORIA_SENSIBLE } from './nucleo/auth/constantes-roles';

export const rutasApp: Routes = [
  { path: '', component: RootComponent },
  { path: 'login', component: PaginaLoginComponent },
  { path: 'acceso-denegado', component: PaginaAccesoDenegadoComponent },
  {
    path: 'ejemplo-sensible',
    component: PaginaEjemploSensibleComponent,
    canActivate: [guardAutenticacion, guardRoles],
    data: { rolesPermitidos: [...ROLES_AUDITORIA_SENSIBLE] },
  },
  { path: '**', redirectTo: '' },
];
