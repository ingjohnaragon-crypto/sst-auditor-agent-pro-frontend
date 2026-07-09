# Plan de Implementación: SP-136 — Diseñar Arquitectura de Carpetas Angular

## Descripción General
Implementar la arquitectura modular escalable para el frontend Angular 17+, siguiendo el patrón core-shared-features. Este plan detalla los pasos necesarios para crear la estructura de directorios base, configurar barrel files y documentar las convenciones de desarrollo.

---

## Objetivos
1. ✓ Crear estructura modular completa (core, shared, features, layout, assets)
2. ✓ Implementar barrel files (`index.ts`) para simplificar imports y encapsulación
3. ✓ Documentar arquitectura, convenciones y guías de desarrollo
4. ✓ Configurar reglas ESLint para enforcar límites de capas
5. ✓ Base lista para agregar features del dominio sin refactorización

---

## Desglose de Tareas

### Fase 1: Estructura Base de Directorios (SP-161)
**Duración estimada**: 30 minutos

#### Tareas
1. **Crear directorios core**
   - `src/app/core/guards/`
   - `src/app/core/interceptors/`
   - `src/app/core/services/`
   - `src/app/core/models/`

2. **Crear directorios shared**
   - `src/app/shared/components/`
   - `src/app/shared/pipes/`
   - `src/app/shared/directives/`

3. **Crear directorios features y layout**
   - `src/app/features/` (raíz para futuros features)
   - `src/app/layout/components/`

4. **Crear directorios de assets y configuración**
   - `src/assets/images/`
   - `src/assets/icons/`
   - `src/assets/styles/`
   - `src/environments/`

5. **Validar estructura**
   - Ejecutar `ng build --strict`
   - Verificar que no hay errores de compilación

#### Archivos a crear
```
src/app/core/guards/                    (directorio vacío)
src/app/core/interceptors/              (directorio vacío)
src/app/core/services/                  (directorio vacío)
src/app/core/models/                    (directorio vacío)
src/app/shared/components/              (directorio vacío)
src/app/shared/pipes/                   (directorio vacío)
src/app/shared/directives/              (directorio vacío)
src/app/features/                       (directorio vacío)
src/app/layout/components/              (directorio vacío)
src/assets/images/                      (directorio vacío)
src/assets/icons/                       (directorio vacío)
src/assets/styles/                      (directorio vacío)
```

---

### Fase 2: Barrel Files y Path Aliases (SP-162)
**Duración estimada**: 45 minutos

#### Tareas
1. **Configurar tsconfig.json con path aliases**
   ```json
   "compilerOptions": {
     "paths": {
       "@app/*": ["src/app/*"],
       "@assets/*": ["src/assets/*"],
       "@core/*": ["src/app/core/*"],
       "@shared/*": ["src/app/shared/*"]
     }
   }
   ```

2. **Crear barrel files en core**
   - `src/app/core/index.ts` — exporta guards, interceptors, services
   - `src/app/core/guards/index.ts` — exporta todos los guards
   - `src/app/core/interceptors/index.ts` — exporta todos los interceptors
   - `src/app/core/services/index.ts` — exporta servicios públicos
   - `src/app/core/models/index.ts` — exporta modelos públicos

3. **Crear barrel files en shared**
   - `src/app/shared/index.ts` — exporta componentes, pipes, directivas
   - `src/app/shared/components/index.ts` — exporta componentes compartidos
   - `src/app/shared/pipes/index.ts` — exporta pipes compartidas
   - `src/app/shared/directives/index.ts` — exporta directivas compartidas

4. **Crear barrel files en layout**
   - `src/app/layout/index.ts` — exporta componentes del layout
   - `src/app/layout/components/index.ts` — exporta componentes internos

5. **Crear barrel file raíz**
   - `src/app/index.ts` — punto de entrada de la aplicación

6. **Template para features**
   - `src/app/features/[feature-template]/index.ts` — patrón a seguir

#### Contenido de Barrel Files

**src/app/core/index.ts**
```typescript
export * from './guards';
export * from './interceptors';
export * from './services';
export * from './models';
```

**src/app/shared/index.ts**
```typescript
export * from './components';
export * from './pipes';
export * from './directives';
```

**src/app/features/[feature-template]/index.ts**
```typescript
// Exportar SOLO el contenedor principal
export { FeatureListComponent } from './containers';
```

#### Validación
- `ng build --strict` sin errores
- Imports usando `@app`, `@core`, `@shared`
- Barrel files exponen solo APIs públicas

---

### Fase 3: Documentación de Arquitectura (SP-163)
**Duración estimada**: 60 minutos

#### Tareas
1. **Crear ARCHITECTURE.md en raíz**
   - Descripción de capas y responsabilidades
   - Diagrama ASCII de dependencias
   - Tabla de convenciones de nomenclatura
   - Reglas de importación permitidas/prohibidas
   - Patrón smart vs dumb components
   - Guía paso a paso: crear nueva feature
   - Ejemplo completo: feature "candidates"
   - Testing: estructura por capa
   - Linting: configuración de import boundaries

2. **Crear README.md por capa**
   - `src/app/core/README.md` — servicios singleton, guards, interceptors
   - `src/app/shared/README.md` — componentes reutilizables, pipes, directivas
   - `src/app/features/README.md` — estructura y pasos para agregar feature
   - `src/app/layout/README.md` — shell components, uso en rutas

3. **Documentar convenciones**
   - Componentes: `PascalCase + Component`
   - Services: `PascalCase + Service`
   - Pipes: `lowercase + pipe`
   - Directives: `lowercase + directive`
   - Guards: `lowercase + guard`
   - Archivos: `kebab-case`
   - Variables: `camelCase`
   - Constantes: `UPPER_SNAKE_CASE`

4. **Documentar patrones**
   - ChangeDetectionStrategy: OnPush obligatorio
   - Typed FormGroup siempre
   - Servicios con providedIn: 'root'
   - Componentes standalone preferido

#### Archivos a crear
```
ARCHITECTURE.md                        # Guía principal
src/app/core/README.md                 # Documentación de core
src/app/shared/README.md               # Documentación de shared
src/app/features/README.md             # Documentación de features
src/app/layout/README.md               # Documentación de layout
```

#### Contenido ARCHITECTURE.md (estructura)
```markdown
# Arquitectura Angular — SST Auditor

## 1. Visión General
Estructura modular escalable basada en core-shared-features.

## 2. Diagrama de Capas
```
layout (shell)
  ↑
features (dominio específico)
  ↑
shared (componentes reutilizables)
  ↑
core (singletons, guards, interceptors)
```

## 3. Tabla de Convenciones
Componentes, servicios, pipes, directives, guards, files, variables, constantes

## 4. Reglas de Importación
✅ Permitido: core/shared/layout desde features
❌ Prohibido: feature importando otra feature

## 5. Patrón Smart vs Dumb
Ejemplos de código con inputs/outputs

## 6. Crear Nueva Feature
Pasos 1-10 con ejemplos

## 7. Servicios y DI
providedIn: 'root', inyección de dependencias

## 8. Barrel Files
Cuándo crear, qué exportar, qué no

## 9. Testing
Estructura por capa, TestBed, HttpClientTestingModule

## 10. Troubleshooting
Errores comunes y soluciones
```

---

### Fase 4: Configuración ESLint (SP-162 complementario)
**Duración estimada**: 30 minutos

#### Tareas
1. **Actualizar/crear eslintrc**
   - Agregar regla `@nx/enforce-module-boundaries` o equivalente
   - Definir límites entre core, shared, features, layout
   - Prohibir imports circulares

2. **Configuración sugerida**
   ```json
   {
     "rules": {
       "@nx/enforce-module-boundaries": [
         "error",
         {
           "allow": [],
           "depConstraints": [
             { "sourceTag": "scope:features", "onlyDependOnLibsWithTags": ["scope:features", "scope:shared", "scope:core"] },
             { "sourceTag": "scope:shared", "onlyDependOnLibsWithTags": ["scope:shared", "scope:core"] },
             { "sourceTag": "scope:core", "onlyDependOnLibsWithTags": ["scope:core"] },
             { "sourceTag": "scope:layout", "onlyDependOnLibsWithTags": ["scope:layout", "scope:shared", "scope:core"] }
           ]
         }
       ]
     }
   }
   ```

3. **Validación**
   - `ng lint` sin warnings
   - ESLint detecta imports prohibidos

---

## Criterios de Aceptación Detallados

### SP-161 (Estructura Base)
- [ ] Directorio `src/app/core/` con subdirectorios guards, interceptors, services, models
- [ ] Directorio `src/app/shared/` con subdirectorios components, pipes, directives
- [ ] Directorio `src/app/features/` (vacío, listo para features)
- [ ] Directorio `src/app/layout/` con subdirectorio components
- [ ] Directorios `src/assets/` con images, icons, styles
- [ ] `src/environments/` con environment.ts y environment.prod.ts
- [ ] `ng build --strict` compila sin errores

### SP-162 (Barrel Files)
- [ ] Archivo `src/app/core/index.ts` exporta guards, interceptors, servicios
- [ ] Archivo `src/app/shared/index.ts` exporta componentes, pipes, directivas
- [ ] Archivo `src/app/layout/index.ts` exporta componentes del layout
- [ ] Path aliases `@app/*`, `@core/*`, `@shared/*`, `@assets/*` configurados en tsconfig.json
- [ ] Imports utilizan aliases: `import { ... } from '@app/core';`
- [ ] `ng build --strict` compila sin errores

### SP-163 (Documentación)
- [ ] Archivo `ARCHITECTURE.md` existe en raíz
- [ ] ARCHITECTURE.md incluye tabla de convenciones (componentes, servicios, pipes, etc.)
- [ ] ARCHITECTURE.md incluye diagrama de capas
- [ ] ARCHITECTURE.md incluye guía paso a paso para crear feature
- [ ] Existe `src/app/core/README.md`
- [ ] Existe `src/app/shared/README.md`
- [ ] Existe `src/app/features/README.md`
- [ ] Existe `src/app/layout/README.md`
- [ ] Documentación es clara y legible para desarrolladores jr

---

## Orden de Ejecución

1. **SP-161** → Crear estructura base (30 min)
   - Crear todos los directorios
   - Validar compilación

2. **SP-162** → Barrel files y aliases (45 min)
   - Configurar tsconfig.json
   - Crear todos los barrel files
   - Actualizar ESLint

3. **SP-163** → Documentación (60 min)
   - Crear ARCHITECTURE.md
   - Crear READMEs por capa
   - Revisar claridad y ejemplos

4. **Validación Final** (15 min)
   - `ng build --strict`
   - `ng lint`
   - Revisar estructura completa

---

## Requisitos No-Funcionales

### Seguridad
- ✓ No exportar servicios privados en barrel files
- ✓ Guards validan autenticación antes de cargar features

### Performance
- ✓ Lazy loading de features (futuro, en app.routes.ts)
- ✓ Componentes standalone evitan módulos innecesarios

### Mantenibilidad
- ✓ Estructura escalable para 10+ features
- ✓ Imports claros y trazables
- ✓ ESLint enforza reglas automáticamente

### Documentación
- ✓ Legible para desarrolladores jr
- ✓ Ejemplos prácticos y copy-paste friendly
- ✓ Anti-patrones documentados

---

## Estimación de Esfuerzo

| Fase | Subtask | Duración | Esfuerzo |
|------|---------|----------|----------|
| Estructura Base | SP-161 | 30 min | 1 point |
| Barrel Files + ESLint | SP-162 | 75 min | 2 points |
| Documentación | SP-163 | 60 min | 2 points |
| **Total** | | **165 min** | **5 points** |

---

## Notas Importantes

1. **No incluir features específicas** — solo estructura y documentación
2. **Componentes de ejemplo** se crearán en stories posteriores
3. **Lazy loading** se configurará después en app.routes.ts
4. **NgRx/Signal Store** para estado global en historia separada
5. **ESLint rules** son críticas para enforcar la arquitectura

---

## Archivos Finales

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── services/
│   │   ├── models/
│   │   └── index.ts
│   ├── shared/
│   │   ├── components/
│   │   ├── pipes/
│   │   ├── directives/
│   │   └── index.ts
│   ├── features/
│   ├── layout/
│   │   ├── components/
│   │   └── index.ts
│   └── index.ts
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
├── app.component.ts
├── app.config.ts
├── app.routes.ts
└── main.ts

ARCHITECTURE.md
src/app/core/README.md
src/app/shared/README.md
src/app/features/README.md
src/app/layout/README.md
```

---

## Próximos Pasos Después de SP-136

1. **SP-XXX**: Crear feature "candidates" como ejemplo
2. **SP-XXX**: Configurar state management (NgRx/Signal Store)
3. **SP-XXX**: Implementar guards de autenticación
4. **SP-XXX**: Configurar HTTP interceptores

