/**
 * Utilidad de navegación post-login.
 * Evita open-redirect: solo rutas relativas internas (`/...`, no `//...`).
 */
export function resolverUrlRetorno(returnUrl: string | null | undefined): string {
  if (!returnUrl) {
    return '/';
  }
  const url = returnUrl.trim();
  if (!url.startsWith('/') || url.startsWith('//')) {
    return '/';
  }
  return url;
}
