# Arquitectura Angular — SST Auditor

Guía completa de la arquitectura modular del frontend Angular 17+.

---

## 1. Visión General

La arquitectura sigue el patrón **core-shared-features**, una estructura modular escalable que promueve:

- **Encapsulación**: Cada capa tiene responsabilidades claras
- **Reutilización**: Código compartido en `shared/`, no duplicación
- **Escalabilidad**: Nuevas features sin acoplamiento existente
- **Mantenibilidad**: Imports claros, límites de capas enforced

### Diagrama de Capas

```
┌─────────────────────────────────────────────┐
│  layout/                                    │  Shell app (header, nav, footer)
│  (root shell components)                    │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  features/[feature-name]/                   │  Domain features
│  ├── containers/  (smart)                   │  ├── logic + state
│  ├── components/  (dumb)                    │  ├── UI + inputs/outputs
│  ├── services/    (API)                     │  └── HTTP, business logic
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  shared/                                    │  Reusable components & utilities
│  ├── components/  (buttons, modals, etc)    │  ├── No business logic
│  ├── pipes/       (date, currency, etc)     │  ├── Generic utilities
│  └── directives/  (focus, permissions)      │  └── Cross-cutting concerns
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│  core/                                      │  Singletons & infrastructure
│  ├── services/    (auth, logging)           │  ├── providedIn: 'root'
│  ├── guards/      (auth, permission)        │  ├── Route protection
│  ├── interceptors/ (error, auth tokens)     │  └── HTTP enrichment
└─────────────────────────────────────────────┘
```

---

## 2. Capas de Arquitectura

### Core Layer (`src/app/core/`)

**Responsabilidad**: Servicios singleton, guards, interceptores.

**Características**:
- `providedIn: 'root'` — singleton automático
- Se inyectan en features, no se importan directamente
- Manejo centralizado de errores y autenticación

**Subcapas**:
- `guards/` — Route guards (auth, permission checks)
- `interceptors/` — HTTP interceptores (tokens, error mapping)
- `services/` — Application services (auth, logging, etc)
- `models/` — Interfaces TypeScript compartidas

**Ejemplo**:
```typescript
// auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap(res => this.currentUser$.next(res.user)));
  }
}
```

### Shared Layer (`src/app/shared/`)

**Responsabilidad**: Componentes reutilizables sin lógica de negocio.

**Características**:
- Componentes presentacionales (dumb)
- Reciben inputs, emiten outputs
- No acceden a servicios de dominio
- Generic utilities (pipes, directives)

**Subcapas**:
- `components/` — Botones, modales, spinners, etc
- `pipes/` — Transformaciones de datos (safe-html, truncate)
- `directives/` — Comportamientos reutilizables (focus, permissions)

**Ejemplo**:
```typescript
// button.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-button',
  template: `<button (click)="onClick()">{{ label }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() label!: string;
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    this.clicked.emit();
  }
}
```

### Features Layer (`src/app/features/`)

**Responsabilidad**: Módulos de dominio específico del negocio.

**Características**:
- Independientes entre sí (NO importar entre features)
- Pueden usar core + shared
- Contienen lógica y estado del dominio

**Estructura por Feature**:
```
features/[feature-name]/
├── containers/        ← Smart components (conectan a servicios/store)
├── components/        ← Dumb components (presentacionales)
├── services/          ← API calls, business logic
├── models/            ← Interfaces TypeScript
└── index.ts           ← Barrel file (exporta solo contenedor)
```

**Ejemplo: Candidates Feature**:
```
features/candidates/
├── containers/
│   ├── candidate-list/
│   │   ├── candidate-list.component.ts    (smart: conecta a store)
│   │   ├── candidate-list.component.html
│   │   └── candidate-list.component.spec.ts
│   └── candidate-detail/
├── components/
│   ├── candidate-card/
│   │   ├── candidate-card.component.ts    (dumb: inputs/outputs)
│   │   └── candidate-card.component.html
├── services/
│   ├── candidate.service.ts               (HTTP, business logic)
├── models/
│   ├── candidate.model.ts                 (interfaces)
└── index.ts                               (exporta CandidateListComponent)
```

### Layout Layer (`src/app/layout/`)

**Responsabilidad**: Shell app components (header, nav, footer).

**Características**:
- Componentes del contenedor principal
- Disponibles en todas las rutas
- Pueden usar core + shared

**Estructura**:
```
layout/
├── components/
│   ├── header/
│   ├── nav/
│   └── footer/
└── shell.component.ts
```

---

## 3. Convenciones de Nomenclatura

| Elemento | Convención | Ejemplo | Ubicación |
|----------|-----------|---------|-----------|
| **Componentes** | PascalCase + `Component` | `CandidateListComponent` | kebab-case file |
| **Services** | PascalCase + `Service` | `CandidateService` | kebab-case file |
| **Pipes** | lowercase + `.pipe.ts` | `safe-html.pipe.ts` | kebab-case |
| **Directives** | lowercase + `.directive.ts` | `has-permission.directive.ts` | kebab-case |
| **Guards** | lowercase + `.guard.ts` | `auth.guard.ts` | kebab-case |
| **Interceptors** | lowercase + `.interceptor.ts` | `error.interceptor.ts` | kebab-case |
| **Models/Interfaces** | PascalCase + `Model` / `DTO` | `CandidateModel`, `UserDTO` | kebab-case file |
| **Archivos TypeScript** | kebab-case | `candidate-list.component.ts` | - |
| **Archivos HTML** | kebab-case | `candidate-list.component.html` | - |
| **Archivos SCSS** | kebab-case | `candidate-list.component.scss` | - |
| **Variables** | camelCase | `candidateId`, `isLoading` | - |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `API_TIMEOUT` | - |

---

## 4. Reglas de Importación

### ✅ Permitido

```typescript
// Desde feature
import { AuthService, AuthGuard } from '@app/core';                 // ✓ core
import { ButtonComponent, SafeHtmlPipe } from '@app/shared';        // ✓ shared
import { CandidateListComponent } from '@app/features/candidates';  // ✓ barrels

// Usando aliases
import { UserService } from '@app/core/services';
import { ButtonComponent } from '@app/shared/components';
```

### ❌ Prohibido

```typescript
// Feature importando otra feature
import { AuditService } from '@app/features/audits/services';        // ✗ NO

// Importar internos, usar barrel
import { ButtonComponent } from '@app/shared/components/button';     // ✗ NO
// Correcto: import { ButtonComponent } from '@app/shared';

// Importar de shared/components internos
import { ButtonComponent } from '@app/shared/components/button/button.component'; // ✗ NO
```

### Patrón de Importación

```typescript
// 1. Angular imports
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 2. RxJS imports
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// 3. Core imports
import { AuthService } from '@app/core';

// 4. Shared imports
import { ButtonComponent } from '@app/shared';

// 5. Feature imports
import { CandidateService } from '../services';
import { CandidateModel } from '../models';

// 6. Relative imports (within same feature)
import { CandidateCardComponent } from './candidate-card';
```

---

## 5. Smart vs Dumb Components

### Dumb Components (Presentacionales)

- **Ubicación**: `features/[feature]/components/`, `shared/components/`
- **Características**:
  - Reciben datos vía `@Input`
  - Emiten eventos vía `@Output`
  - No llaman servicios
  - NO inyectan servicios
  - Reutilizables en múltiples contextos
- **Change Detection**: Siempre `OnPush`
- **Typed Forms**: Sí, con `FormGroup<T>`

```typescript
@Component({
  selector: 'app-candidate-card',
  template: `
    <div class="card">
      <h3>{{ candidate.name }}</h3>
      <p>{{ candidate.email }}</p>
      <button (click)="onEdit()">Editar</button>
      <button (click)="onDelete()">Eliminar</button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateCardComponent {
  @Input() candidate!: Candidate;
  @Output() edit = new EventEmitter<Candidate>();
  @Output() delete = new EventEmitter<Candidate>();

  onEdit() {
    this.edit.emit(this.candidate);
  }

  onDelete() {
    this.delete.emit(this.candidate);
  }
}
```

### Smart Components (Contenedores)

- **Ubicación**: `features/[feature]/containers/`
- **Características**:
  - Conectan a servicios y store
  - Manejan lógica y estado
  - Pasan datos a componentes dumb
  - Escuchan outputs de componentes dumb
  - Llaman servicios HTTP
- **Change Detection**: Siempre `OnPush`

```typescript
@Component({
  selector: 'app-candidate-list',
  template: `
    <div>
      <app-button (clicked)="onAddClick()">Agregar Candidato</app-button>
      <app-candidate-card
        *ngFor="let candidate of candidates$ | async"
        [candidate]="candidate"
        (edit)="onEdit($event)"
        (delete)="onDelete($event)"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateListComponent implements OnInit {
  candidates$: Observable<Candidate[]>;

  constructor(private candidateService: CandidateService) {
    this.candidates$ = this.candidateService.getCandidates();
  }

  onEdit(candidate: Candidate) {
    this.candidateService.updateCandidate(candidate).subscribe();
  }

  onDelete(candidate: Candidate) {
    this.candidateService.deleteCandidate(candidate.id).subscribe();
  }

  onAddClick() {
    // Navigate or open modal
  }
}
```

---

## 6. Crear Nueva Feature

### Paso 1: Crear estructura

```bash
mkdir -p src/app/features/[feature-name]/{containers,components,services,models}
```

### Paso 2: Crear modelos

```typescript
// src/app/features/[feature-name]/models/[feature].model.ts
export interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'activo' | 'inactivo';
}
```

### Paso 3: Crear servicio

```typescript
// src/app/features/[feature-name]/services/[feature].service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Candidate } from '../models';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  constructor(private http: HttpClient) {}

  getCandidates() {
    return this.http.get<Candidate[]>('/api/candidates');
  }

  getCandidateById(id: string) {
    return this.http.get<Candidate>(`/api/candidates/${id}`);
  }

  createCandidate(candidate: Omit<Candidate, 'id'>) {
    return this.http.post<Candidate>('/api/candidates', candidate);
  }

  updateCandidate(candidate: Candidate) {
    return this.http.put<Candidate>(`/api/candidates/${candidate.id}`, candidate);
  }

  deleteCandidate(id: string) {
    return this.http.delete(`/api/candidates/${id}`);
  }
}
```

### Paso 4: Crear componentes dumb

```typescript
// src/app/features/[feature-name]/components/[component].component.ts
@Component({
  selector: 'app-candidate-card',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateCardComponent {
  @Input() candidate!: Candidate;
  @Output() edit = new EventEmitter<Candidate>();
  @Output() delete = new EventEmitter<Candidate>();
}
```

### Paso 5: Crear contenedor smart

```typescript
// src/app/features/[feature-name]/containers/[container].component.ts
@Component({
  selector: 'app-candidate-list',
  template: `...`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateListComponent implements OnInit {
  candidates$: Observable<Candidate[]>;

  constructor(private candidateService: CandidateService) {
    this.candidates$ = this.candidateService.getCandidates();
  }
}
```

### Paso 6: Crear barrel file

```typescript
// src/app/features/[feature-name]/index.ts
export { CandidateListComponent } from './containers';
```

### Paso 7: Crear modelos barrel file

```typescript
// src/app/features/[feature-name]/models/index.ts
export * from './[feature].model';
```

### Paso 8: Crear servicios barrel file

```typescript
// src/app/features/[feature-name]/services/index.ts
export * from './[feature].service';
```

### Paso 9: Crear componentes barrel file

```typescript
// src/app/features/[feature-name]/components/index.ts
export { CandidateCardComponent } from './candidate-card';
```

### Paso 10: Configurar ruta

```typescript
// src/app/app.routes.ts
export const routes: Routes = [
  {
    path: 'candidates',
    loadComponent: () => import('@app/features/candidates').then(m => m.CandidateListComponent)
  }
];
```

---

## 7. Servicios e Inyección de Dependencias

### Servicios Core (Singletons)

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Singleton automático
}
```

### Servicios Feature

```typescript
@Injectable({ providedIn: 'root' })
export class CandidateService {
  // También singleton, pero scoped lógicamente a la feature
}
```

### Nunca hacer

```typescript
// ❌ NO hacer new
const service = new CandidateService();

// ✓ Siempre inyectar
constructor(private candidateService: CandidateService) {}
```

---

## 8. Barrel Files

### Cuándo crear

- Cada capa principal: `core/`, `shared/`, `layout/`
- Cada subcapa con múltiples exports: `guards/`, `services/`, `components/`
- Cada feature: exporta SOLO el contenedor principal

### Qué exportar

```typescript
// ✓ core/index.ts
export * from './guards';        // Todo público
export * from './interceptors';  // Todo público
export * from './services';      // Servicios públicos

// ✓ shared/index.ts
export * from './components';    // Componentes públicos
export * from './pipes';         // Pipes públicas
export * from './directives';    // Directivas públicas

// ✓ features/candidates/index.ts
export { CandidateListComponent } from './containers';  // Solo contenedor
```

### Qué NO exportar

```typescript
// ❌ No exportar internos
export { CandidateCardComponent } from './components';  // Privado

// ❌ No exportar servicios de feature en raíz
export { CandidateService } from './services';  // Solo si necesario
```

---

## 9. Testing

### Test de Componentes (Dumb)

```typescript
describe('CandidateCardComponent', () => {
  let component: CandidateCardComponent;
  let fixture: ComponentFixture<CandidateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateCardComponent);
    component = fixture.componentInstance;
    component.candidate = { id: '1', name: 'John', email: 'john@test.com', status: 'activo' };
    fixture.detectChanges();
  });

  it('should display candidate name', () => {
    expect(fixture.nativeElement.textContent).toContain('John');
  });

  it('should emit edit event', () => {
    spyOn(component.edit, 'emit');
    component.onEdit();
    expect(component.edit.emit).toHaveBeenCalledWith(component.candidate);
  });
});
```

### Test de Servicios

```typescript
describe('CandidateService', () => {
  let service: CandidateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandidateService]
    });

    service = TestBed.inject(CandidateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should get candidates', () => {
    const mockCandidates = [{ id: '1', name: 'John', email: 'john@test.com', status: 'activo' }];

    service.getCandidates().subscribe(result => {
      expect(result).toEqual(mockCandidates);
    });

    const req = httpMock.expectOne('/api/candidates');
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidates);
  });

  afterEach(() => {
    httpMock.verify();
  });
});
```

---

## 10. Troubleshooting

### Problema: "Cannot find module '@app/core'"

**Solución**: Verificar `tsconfig.json` tiene path alias:
```json
"compilerOptions": {
  "paths": {
    "@app/*": ["src/app/*"]
  }
}
```

### Problema: Feature importa otra feature

**Solución**: ESLint debería detectarlo. Movimiento datos a `shared/` si son reutilizables:
```typescript
// ❌ NO: candidates importa audits
import { AuditService } from '@app/features/audits';

// ✓ SI: Compartir en core o shared
import { AuditService } from '@app/core';
```

### Problema: Componente sin OnPush strategy

**Solución**: Siempre agregar:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Problema: FormGroup no tipado

**Solución**: Usar typed FormGroup:
```typescript
// ❌ NO
const form = this.fb.group({ name: '' });

// ✓ SI
interface CandidateForm {
  name: FormControl<string>;
  email: FormControl<string>;
}
const form = this.fb.group<CandidateForm>({
  name: new FormControl('', Validators.required),
  email: new FormControl('', Validators.email)
});
```

---

## Referencias

- [Angular Architecture Guide](https://angular.io/guide/architecture)
- [Angular Standalone Components](https://angular.io/guide/standalone-components)
- [RxJS Best Practices](https://rxjs.dev/)
- [Testing Angular](https://angular.io/guide/testing)

