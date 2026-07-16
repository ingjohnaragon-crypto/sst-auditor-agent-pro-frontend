import { rutasApp } from './app.routes';
import { ROLES_AUDITORIA_SENSIBLE } from './nucleo/auth/constantes-roles';

describe('rutasApp', () => {
  it('should definir login, acceso-denegado y ejemplo-sensible', () => {
    const paths = rutasApp.map((r) => r.path);
    expect(paths).toEqual(expect.arrayContaining(['', 'login', 'acceso-denegado', 'ejemplo-sensible']));
  });

  it('should restringir ejemplo-sensible a roles de auditoria sensible', () => {
    const sensible = rutasApp.find((r) => r.path === 'ejemplo-sensible');
    expect(sensible?.data?.['rolesPermitidos']).toEqual([...ROLES_AUDITORIA_SENSIBLE]);
    expect(sensible?.canActivate?.length).toBe(2);
  });
});
