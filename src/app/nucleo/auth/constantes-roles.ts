import type { RolUsuario } from "./modelos/usuario-autenticado";

/** Roles con acceso a info médica e índices de siniestralidad. */
export const ROLES_AUDITORIA_SENSIBLE: readonly RolUsuario[] = ["ADMINISTRADOR", "AUDITOR_SST"];

/** Roles habilitados para mutar recursos SST; CONSULTA permanece en solo lectura. */
export const ROLES_ESCRITURA_SST: readonly RolUsuario[] = ["ADMINISTRADOR", "AUDITOR_SST"];
