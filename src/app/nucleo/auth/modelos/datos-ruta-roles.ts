import type { RolUsuario } from './usuario-autenticado';

/** Datos de ruta para `guardRoles` (`route.data`). */
export interface DatosRutaRoles {
  rolesPermitidos: RolUsuario[];
}
