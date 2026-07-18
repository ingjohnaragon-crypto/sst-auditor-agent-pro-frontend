# Estilos globales

La fuente única del lenguaje visual está en:

- `src/styles/design-tokens.css`: variables CSS y clases semánticas compartidas.
- `src/styles.css`: entrada global; importa tokens y configura Tailwind/base.
- `tailwind.config.cjs`: escaneo y extensión del tema Tailwind.

## Regla de uso

1. Usar variables `--sst-*` para colores, radios, sombras y tipografías comunes.
2. Reutilizar clases semánticas (`sst-superficie`, `sst-etiqueta`,
   `sst-campo`, `sst-boton-primario`) antes de duplicar combinaciones.
3. Mantener en el `.component.css` únicamente estilos propios del componente.
4. No definir tokens globales dentro de un componente.
5. Cualquier token nuevo debe agregarse aquí y documentar su propósito.

Tailwind continúa siendo la herramienta principal para layout y responsive. Los
tokens garantizan consistencia y evitan que cada feature invente una paleta o
medidas diferentes.
