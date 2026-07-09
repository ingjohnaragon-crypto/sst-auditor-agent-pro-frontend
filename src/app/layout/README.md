# Layout Layer

Componentes del shell de la aplicación (header, nav, footer).

## Estructura

```
layout/
├── components/
│   ├── header/
│   │   ├── header.component.ts
│   │   ├── header.component.html
│   │   └── header.component.scss
│   ├── nav/
│   │   ├── nav.component.ts
│   │   ├── nav.component.html
│   │   └── nav.component.scss
│   └── footer/
│       ├── footer.component.ts
│       ├── footer.component.html
│       └── footer.component.scss
├── shell.component.ts
└── index.ts
```

## Características

- **Shell app**: Contenedor principal de la aplicación
- **Disponible en todas rutas**: Header, nav, footer
- **Pueden usar core + shared**
- **Responsive**: Adaptable a mobile/tablet/desktop

## Shell Component

```typescript
// src/app/layout/shell.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { NavComponent } from './components/nav/nav.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-shell',
  template: `
    <app-header></app-header>
    <div class="main-container">
      <app-nav></app-nav>
      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-footer></app-footer>
  `,
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, NavComponent, FooterComponent]
})
export class ShellComponent {}
```

## Header Component

```typescript
// src/app/layout/components/header/header.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  template: `
    <header class="header">
      <div class="header-content">
        <h1>SST Auditor</h1>
        <nav class="header-nav">
          <a routerLink="/dashboard">Dashboard</a>
          <a routerLink="/candidates">Candidatos</a>
          <a routerLink="/audits">Auditorías</a>
        </nav>
        <div class="user-menu">
          <span>{{ currentUser$ | async | json }}</span>
          <button (click)="onLogout()">Logout</button>
        </div>
      </div>
    </header>
  `,
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  currentUser$ = this.authService.getCurrentUser();

  constructor(private authService: AuthService, private router: Router) {}

  onLogout() {
    this.router.navigate(['/login']);
  }
}
```

## Nav Component

```typescript
// src/app/layout/components/nav/nav.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  template: `
    <nav class="sidebar">
      <ul>
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/candidates" routerLinkActive="active">Candidatos</a></li>
        <li><a routerLink="/audits" routerLinkActive="active">Auditorías</a></li>
        <li><a routerLink="/users" routerLinkActive="active">Usuarios</a></li>
      </ul>
    </nav>
  `,
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavComponent {}
```

## Footer Component

```typescript
// src/app/layout/components/footer/footer.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="footer">
      <p>&copy; 2024 SST Auditor. All rights reserved.</p>
    </footer>
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent {}
```

## Usar en App Routes

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ShellComponent } from '@app/layout';

export const routes: Routes = [
  {
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('@app/features/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'candidates',
        loadComponent: () => import('@app/features/candidates').then(m => m.CandidateListComponent)
      },
      {
        path: 'audits',
        loadComponent: () => import('@app/features/audits').then(m => m.AuditListComponent)
      }
    ]
  },
  {
    path: 'login',
    loadComponent: () => import('@app/features/auth').then(m => m.LoginComponent)
  }
];
```

## Styling (src/app/layout/layout.scss)

```scss
.header {
  background-color: #1a1a1a;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .header-nav {
    display: flex;
    gap: 2rem;
    align-items: center;

    a {
      color: white;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: #007bff;
      }
    }
  }

  .user-menu {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
}

.main-container {
  display: flex;
  min-height: calc(100vh - 200px);
}

.sidebar {
  width: 250px;
  background-color: #f5f5f5;
  padding: 1rem;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      margin-bottom: 0.5rem;

      a {
        display: block;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        border-radius: 4px;
        transition: background-color 0.3s;

        &:hover {
          background-color: #e0e0e0;
        }

        &.active {
          background-color: #007bff;
          color: white;
        }
      }
    }
  }
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.footer {
  background-color: #1a1a1a;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}
```

## Imports desde layout

```typescript
// ✓ Correcto
import { ShellComponent, HeaderComponent } from '@app/layout';

// ❌ Incorrecto
import { HeaderComponent } from '@app/layout/components/header';  // Usa barrel
```

