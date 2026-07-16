export type RolUsuario = 'ADMINISTRADOR' | 'AUDITOR_SST' | 'CONSULTA';

export interface UsuarioAutenticado {
  id: string;
  nombre_completo: string;
  correo: string;
  rol: RolUsuario;
}
