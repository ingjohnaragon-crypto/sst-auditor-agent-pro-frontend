/** Convierte la URL relativa del enlace de descarga en una URL absoluta del API. */
export function resolverUrlAbsoluta(url: string, apiBaseUrl: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const origen = new URL(apiBaseUrl).origin;
  return `${origen}${url.startsWith('/') ? url : `/${url}`}`;
}
