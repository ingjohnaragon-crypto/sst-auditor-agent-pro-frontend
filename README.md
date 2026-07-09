# SST Auditor — Frontend Angular

Frontend de auditoría de Seguridad y Salud en el Trabajo (SST), construido con **Angular 17+** y potenciado por **OpenSpec**, un framework de desarrollo impulsado por IA.

## 📋 Contenidos

- [Sobre OpenSpec](#sobre-openspec)
- [Sobre SST Auditor](#sobre-sst-auditor)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Desarrollo](#desarrollo)
- [Comandos OpenSpec](#comandos-openspec)
- [Arquitectura Angular](#arquitectura-angular)
- [Git Workflow](#git-workflow)
- [Testing](#testing)

---

## 🤖 Sobre OpenSpec

**OpenSpec** es un framework que conecta **Jira**, el repositorio de código y un agente IA en un flujo de desarrollo unificado y spec-driven.

### Cómo funciona

```
Ticket Jira
    +
Specs del Proyecto (arquitectura, estándares, convenciones)
    +
Stack Activo (Angular, Java, Python, Node, Go, React)
    +
Agente IA Activo (Copilot, Claude Code, Cursor, Aider)
    ↓
Un comando CLI
    ↓
Prompt enriquecido → IA genera plan / implementación / review
```

### Características

- ✅ **Spec-driven**: Toda la arquitectura se almacena en specs estructurados
- ✅ **Multi-stack**: Java, Python, Node, Go, Angular, React
- ✅ **Multi-agent**: GitHub Copilot, Claude Code, Cursor, Aider, Windsurf
- ✅ **Jira integration**: Automaticamente conecta con Jira
- ✅ **Git workflow**: Automatiza rama, commit, PR, code review

### 13 Comandos CLI

| Comando | Descripción |
|---------|-------------|
| `os-stack --list` | Listar stacks disponibles |
| `os-stack angular` | Cambiar stack activo |
| `os-agent --list` | Listar agentes disponibles |
| `os-agent copilot` | Cambiar agente activo |
| `os-tickets` | Ver todos los tickets |
| `os-enrich KAN-XX` | Enriquecer ticket con detalles técnicos |
| `os-enrich-apply KAN-XX` | Subir enriquecimiento a Jira |
| `os-plan KAN-XX` | Generar plan de implementación |
| `os-develop KAN-XX` | Crear rama feature + prompt |
| `os-commit KAN-XX` | Commitear + push + crear PR |
| `os-review 1` | Generar code review con IA |
| `os-review-apply 1` | Publicar review en GitHub |
| `os-transition KAN-XX "Done"` | Cambiar estado del ticket |

---

## 📱 Sobre SST Auditor

**SST Auditor** es una aplicación web para auditoría y gestión de Seguridad y Salud en el Trabajo.

### Características

- 📊 Dashboard de auditorías
- 👥 Gestión de candidatos
- 📋 Auditorías de cumplimiento
- 📈 Reportes y estadísticas
- 🔐 Autenticación y permisos

### Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| **Framework** | Angular 17+ (Standalone Components) |
| **Lenguaje** | TypeScript 5.x (strict mode) |
| **State** | NgRx / Angular Signals |
| **Estilos** | SCSS + Angular Material / Tailwind CSS |
| **HTTP** | Angular HttpClient |
| **Testing** | Jest + Angular Testing Library |
| **Build** | Angular CLI |

---

## 📁 Estructura del Proyecto

```
sst-auditor-agent-pro-frontend/
├── src/
│   ├── app/                    # Aplicación Angular
│   │   ├── core/               # Servicios, guards, interceptores
│   │   ├── shared/             # Componentes reutilizables
│   │   ├── features/           # Features de negocio
│   │   ├── layout/             # Shell app
│   │   └── index.ts            # Barrel file
│   ├── assets/                 # Imágenes, iconos, estilos
│   ├── environments/           # Configuración (dev, prod)
│   └── main.ts                 # Entry point
│
├── ai-specs/                   # Contexto del Proyecto (OpenSpec)
│   ├── .agents/stacks/
│   │   └── frontend-angular.md  # Perfil del agente Angular
│   ├── specs/stacks/
│   │   └── frontend-angular-standards.mdc  # Estándares Angular
│   ├── changes/
│   │   ├── planes/             # Planes generados
│   │   └── enriquecimientos/   # Enriquecimientos
│   └── README.md               # Documentación de specs
│
├── .openspec-cli/              # CLI de OpenSpec
│   ├── commands/               # 13 comandos
│   ├── lib/                    # Librerías compartidas
│   └── install.sh              # Instalador
│
├── .github/workflows/          # GitHub Actions
│   └── ci.yml                  # Pipeline CI/CD
│
├── angular.json                # Config Angular
├── tsconfig.json               # Config TypeScript + path aliases
├── package.json                # Dependencias npm
├── .env.example                # Template de variables
├── ARCHITECTURE.md             # Guía de arquitectura Angular
└── README.md                   # Este archivo
```

---

## ✅ Requisitos

- **Node.js**: 18+ (LTS)
- **npm**: 9+
- **Angular CLI**: 17+
- **Git**: 2.35+
- **Git Bash**: Para Windows (incluido con Git)
- **API Token Jira**: https://id.atlassian.com/manage-profile/security/api-tokens
- **GitHub Token**: https://github.com/settings/tokens

---

## 📦 Instalación

### 1. Clonar repositorio

```bash
git clone https://github.com/ingjohnaragon-crypto/sst-auditor-agent-pro-frontend.git
cd sst-auditor-agent-pro-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales
```

**Contenido de .env**:
```bash
JIRA_BASE_URL=https://tu-workspace.atlassian.net
JIRA_EMAIL=tu-email@example.com
JIRA_TOKEN=tu-jira-api-token
```

### 4. Verificar instalación

```bash
ng serve              # Dev server en http://localhost:4200
npm test              # Ejecutar tests
```

---

## 💻 Desarrollo

### Iniciar dev server

```bash
ng serve
# Abrir: http://localhost:4200
```

### Ejecutar tests

```bash
ng test --watch=false          # Tests una sola vez
ng test --code-coverage        # Con coverage
ng test                        # En modo watch
```

### Build para producción

```bash
ng build --prod
# Output: dist/sst-auditor/
```

### Lint y formateo

```bash
ng lint                        # ESLint
npm run format                 # Formatear código
```

---

## 🤖 Comandos OpenSpec

### Workflow completo

```bash
# 1. Seleccionar stack y agente
os-stack frontend-angular
os-agent copilot

# 2. Ver y crear tickets
os-tickets
os-create-ticket --hu

# 3. Enriquecer ticket
os-enrich SP-136
os-enrich-apply SP-136

# 4. Generar plan
os-plan SP-136

# 5. Implementar (pegar prompt en Copilot)
os-develop SP-136

# 6. Tests
ng test --watch=false

# 7. Commitear
os-commit SP-136

# 8. Code review
os-review 1
os-review-apply 1

# 9. Marcar como completado
os-transition SP-136 "Done"
```

---

## 🏗️ Arquitectura Angular

### Patrón Modular: Core-Shared-Features

```
core/       ← Singletons (servicios, guards, interceptores)
  ↑
shared/     ← Componentes reutilizables (botones, modales)
  ↑
features/   ← Features de negocio (candidates, audits)
  ↑
layout/     ← Shell app (header, nav, footer)
```

### Capas

| Capa | Ubicación | Responsabilidad | Ejemplo |
|------|-----------|-----------------|---------|
| **Core** | `src/app/core/` | Servicios singleton, guards, interceptores | `AuthService`, `AuthGuard` |
| **Shared** | `src/app/shared/` | Componentes dumb, pipes, directivas | `ButtonComponent`, `SafeHtmlPipe` |
| **Features** | `src/app/features/[feature]/` | Lógica de dominio | `CandidatesFeature`, `AuditsFeature` |
| **Layout** | `src/app/layout/` | Shell components | `HeaderComponent`, `NavComponent` |

### Convenciones

- **Componentes**: `PascalCase` + `Component` → archivo: `kebab-case.component.ts`
- **Servicios**: `PascalCase` + `Service` → archivo: `kebab-case.service.ts`
- **Pipes**: `lowercase.pipe.ts`
- **Directivas**: `lowercase.directive.ts`
- **Guards**: `lowercase.guard.ts`
- **Interceptores**: `lowercase.interceptor.ts`
- **Imports**: Usar path aliases `@app/*`, `@core/*`, `@shared/*`

### Reglas de Importación

```typescript
// ✓ Correcto
import { AuthService } from '@app/core';
import { ButtonComponent } from '@app/shared';
import { CandidateListComponent } from '@app/features/candidates';

// ✗ Incorrecto
import { AuthService } from '@app/core/services/auth.service';  // Usar barrel
import { ButtonComponent } from '@app/shared/components/button';  // Usar barrel
import { AuditService } from '@app/features/audits';  // NO: feature importa feature
```

### Smart vs Dumb Components

**Dumb (Presentacionales)**:
- Solo `@Input` y `@Output`
- No inyectan servicios
- Reutilizables
- En `components/`

**Smart (Contenedores)**:
- Conectan a servicios/store
- Manejan lógica
- En `containers/`

**Para más detalles, ver [ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## 🔄 Git Workflow

### Ramas

```
main/       ← Producción
  ↑
develop/    ← Staging
  ↑
feature/*   ← Features (creadas por os-develop)
```

### Commits Convencionales (Español)

```
tipo(alcance): descripción

[cuerpo opcional]
[pie de página]
```

**Tipos**:
- `feat`: Nueva característica
- `fix`: Bug fix
- `docs`: Documentación
- `style`: Formato (espacios, comillas)
- `refactor`: Refactorización
- `perf`: Performance
- `test`: Tests
- `chore`: Build, deps, etc

**Ejemplo**:
```
feat(candidates): agregar filtro de estado

- Agregar campo de búsqueda
- Implementar servicio de filtrado
- Tests para componente

Fixes SP-136
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

---

## 🧪 Testing

### Estructura

```
src/
├── app/
│   ├── services/
│   │   ├── auth.service.ts
│   │   └── auth.service.spec.ts      ← Test
│   └── components/
│       ├── button.component.ts
│       └── button.component.spec.ts  ← Test
```

### Test de Componente

```typescript
describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should emit clicked event', () => {
    spyOn(component.clicked, 'emit');
    component.onClick();
    expect(component.clicked.emit).toHaveBeenCalled();
  });
});
```

### Test de Servicio

```typescript
describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should login', () => {
    service.login('user@test.com', 'password').subscribe(token => {
      expect(token).toBeTruthy();
    });

    const req = httpMock.expectOne('/api/auth/login');
    req.flush({ token: 'jwt-token' });
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

### Coverage

```bash
ng test --code-coverage --watch=false
# Abrir: coverage/sst-auditor/index.html
```

**Meta**: 90% coverage

---

## 📚 Documentación

- **ARCHITECTURE.md** — Guía completa de arquitectura Angular
- **src/app/core/README.md** — Documentación de capa core
- **src/app/shared/README.md** — Documentación de componentes compartidos
- **src/app/features/README.md** — Cómo crear nuevas features
- **src/app/layout/README.md** — Documentación de shell app

---

## 🚀 Deployment

### Build

```bash
ng build --prod
```

### Entornos

**Desarrollo** (`src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

**Producción** (`src/environments/environment.prod.ts`):
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.sst-auditor.com/api'
};
```

---

## 🤝 Contribución

1. **Seleccionar ticket**: `os-tickets`
2. **Enriquecer**: `os-enrich KAN-XX` → `os-enrich-apply KAN-XX`
3. **Generar plan**: `os-plan KAN-XX`
4. **Implementar**: `os-develop KAN-XX` (pegar prompt en Copilot)
5. **Validar**: `ng test --watch=false`
6. **Commitear**: `os-commit KAN-XX`
7. **Review**: `os-review PR_NUMBER` → `os-review-apply PR_NUMBER`

---

## 📖 Recursos

- [Angular Docs](https://angular.io)
- [RxJS Docs](https://rxjs.dev)
- [TypeScript Docs](https://www.typescriptlang.org)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [Jira Project](https://ingjohnaragon.atlassian.net)

---

## 📝 Licencia

Código propietario — SST Auditor

---

## 👨‍💻 Autores

- **John Aragón** — Lead Frontend Developer
- **Copilot AI** — IA Asistente

---

## 🔗 Enlaces

- Repositorio: https://github.com/ingjohnaragon-crypto/sst-auditor-agent-pro-frontend
- Jira: https://ingjohnaragon.atlassian.net
- Arquitectura: [ARCHITECTURE.md](./ARCHITECTURE.md)
