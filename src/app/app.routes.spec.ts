import { rutasApp } from './app.routes';
import { ROLES_AUDITORIA_SENSIBLE } from './nucleo/auth/constantes-roles';

describe('rutasApp', () => {
  it('should definir login y acceso-denegado fuera del shell', () => {
    const paths = rutasApp.map((r) => r.path);
    expect(paths).toEqual(expect.arrayContaining(['', 'login', 'acceso-denegado']));
  });

  it('should proteger el shell y redirigir su raiz al dashboard', () => {
    const shell = rutasApp.find((r) => r.path === '');
    const raiz = shell?.children?.find((r) => r.path === '');
    const dashboard = shell?.children?.find((r) => r.path === 'dashboard');

    expect(shell?.canActivate?.length).toBe(1);
    expect(raiz?.redirectTo).toBe('dashboard');
    expect(dashboard?.loadComponent).toBeDefined();
  });

  it('should restringir ejemplo-sensible a roles de auditoria sensible', () => {
    const shell = rutasApp.find((r) => r.path === '');
    const sensible = shell?.children?.find((r) => r.path === 'ejemplo-sensible');

    expect(sensible?.data?.['rolesPermitidos']).toEqual([...ROLES_AUDITORIA_SENSIBLE]);
    expect(sensible?.canActivate?.length).toBe(1);
  });
});
