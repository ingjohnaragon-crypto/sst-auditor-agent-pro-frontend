# Features Layer

Módulos de dominio específico del negocio. Independientes entre sí.

## Estructura por Feature

```
features/[feature-name]/
├── containers/          # Smart components (conectan a servicios/store)
├── components/          # Dumb components (presentacionales)
├── services/            # API calls, business logic
├── models/              # Interfaces TypeScript
└── index.ts             # Barrel file (exporta SOLO contenedor)
```

## Características

- **Independientes**: NO importan otras features
- **Pueden usar**: core/, shared/, layout/
- **Lógica de dominio**: Toda aquí
- **Estado y API**: Aquí viven
- **Ejemplo**: candidates, audits, users, etc

## Ejemplo: Candidates Feature

```
features/candidates/
├── containers/
│   ├── candidate-list/
│   │   ├── candidate-list.component.ts
│   │   ├── candidate-list.component.html
│   │   └── candidate-list.component.spec.ts
│   ├── candidate-detail/
│   └── index.ts
├── components/
│   ├── candidate-card/
│   │   ├── candidate-card.component.ts
│   │   ├── candidate-card.component.html
│   │   └── candidate-card.component.spec.ts
│   └── index.ts
├── services/
│   ├── candidate.service.ts
│   └── index.ts
├── models/
│   ├── candidate.model.ts
│   └── index.ts
└── index.ts
```

## Crear Nueva Feature (Pasos)

### 1. Crear directorios

```bash
mkdir -p src/app/features/candidates/{containers,components,services,models}
```

### 2. Crear modelos

```typescript
// src/app/features/candidates/models/candidate.model.ts
export interface Candidate {
  id: string;
  name: string;
  email: string;
  status: 'activo' | 'inactivo';
  createdAt: Date;
}

export interface CandidateFilter {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}
```

### 3. Crear servicio

```typescript
// src/app/features/candidates/services/candidate.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Candidate, CandidateFilter } from '../models';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private api = '/api/candidates';

  constructor(private http: HttpClient) {}

  getCandidates(filter?: CandidateFilter) {
    let params = new HttpParams();
    if (filter?.status) params = params.set('status', filter.status);
    if (filter?.search) params = params.set('search', filter.search);
    return this.http.get<Candidate[]>(this.api, { params });
  }

  getCandidateById(id: string) {
    return this.http.get<Candidate>(`${this.api}/${id}`);
  }

  createCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'>) {
    return this.http.post<Candidate>(this.api, candidate);
  }

  updateCandidate(id: string, candidate: Partial<Candidate>) {
    return this.http.put<Candidate>(`${this.api}/${id}`, candidate);
  }

  deleteCandidate(id: string) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
```

### 4. Crear componentes dumb

```typescript
// src/app/features/candidates/components/candidate-card/candidate-card.component.ts
import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { Candidate } from '../../models';

@Component({
  selector: 'app-candidate-card',
  template: `
    <div class="card">
      <h3>{{ candidate.name }}</h3>
      <p>{{ candidate.email }}</p>
      <span [class.active]="candidate.status === 'activo'">
        {{ candidate.status }}
      </span>
      <div class="actions">
        <button (click)="onEdit()">Editar</button>
        <button (click)="onDelete()">Eliminar</button>
      </div>
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

### 5. Crear contenedor smart

```typescript
// src/app/features/candidates/containers/candidate-list/candidate-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { Candidate } from '../../models';
import { CandidateService } from '../../services';

@Component({
  selector: 'app-candidate-list',
  template: `
    <div class="container">
      <h1>Candidatos</h1>
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
  candidates$!: Observable<Candidate[]>;

  constructor(private candidateService: CandidateService) {}

  ngOnInit() {
    this.candidates$ = this.candidateService.getCandidates();
  }

  onEdit(candidate: Candidate) {
    this.candidateService.updateCandidate(candidate.id, candidate).subscribe();
  }

  onDelete(candidate: Candidate) {
    this.candidateService.deleteCandidate(candidate.id).subscribe();
  }

  onAddClick() {
    // Navigate to create page or open modal
  }
}
```

### 6. Crear barrel files

```typescript
// src/app/features/candidates/models/index.ts
export * from './candidate.model';

// src/app/features/candidates/services/index.ts
export * from './candidate.service';

// src/app/features/candidates/components/index.ts
export { CandidateCardComponent } from './candidate-card/candidate-card.component';

// src/app/features/candidates/containers/index.ts
export { CandidateListComponent } from './candidate-list/candidate-list.component';

// src/app/features/candidates/index.ts
export { CandidateListComponent } from './containers';
// NO exportar componentes internos, servicios, modelos
```

### 7. Configurar ruta

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'candidates',
    loadComponent: () => import('@app/features/candidates').then(m => m.CandidateListComponent)
  }
];
```

## Imports desde feature

```typescript
// ✓ Correcto
import { CandidateListComponent } from '@app/features/candidates';
import { CandidateService } from '@app/features/candidates';
import { Candidate } from '@app/features/candidates';

// ❌ Incorrecto
import { CandidateCardComponent } from '@app/features/candidates';  // Privado
import { CandidateListComponent } from '@app/features/candidates/containers';  // Usa barrel
```

## No permitido

```typescript
// ❌ Feature importando otra feature
import { AuditService } from '@app/features/audits';

// ✓ Usar core/shared si son reutilizables
import { LoggerService } from '@app/core';
import { ButtonComponent } from '@app/shared';
```

## Testing

```typescript
describe('CandidateListComponent', () => {
  let component: CandidateListComponent;
  let fixture: ComponentFixture<CandidateListComponent>;
  let candidateService: CandidateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CandidateListComponent, HttpClientTestingModule],
      providers: [CandidateService]
    }).compileComponents();

    fixture = TestBed.createComponent(CandidateListComponent);
    component = fixture.componentInstance;
    candidateService = TestBed.inject(CandidateService);
  });

  it('should load candidates on init', (done) => {
    const mockCandidates = [{ id: '1', name: 'John', email: 'john@test.com', status: 'activo', createdAt: new Date() }];
    spyOn(candidateService, 'getCandidates').and.returnValue(of(mockCandidates));

    component.ngOnInit();
    component.candidates$.subscribe(candidates => {
      expect(candidates).toEqual(mockCandidates);
      done();
    });
  });
});
```

