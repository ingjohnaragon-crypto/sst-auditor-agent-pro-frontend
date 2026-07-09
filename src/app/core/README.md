# Core Layer

Servicios singleton, guards, interceptores e interfaces de la aplicación.

## Estructura

```
core/
├── guards/              # Route guards (autenticación, permisos)
├── interceptors/        # HTTP interceptores (tokens, errores)
├── services/            # Servicios de aplicación
├── models/              # Interfaces TypeScript
└── index.ts             # Barrel file
```

## Responsabilidades

- **Singletons**: Todos los servicios son `providedIn: 'root'`
- **Guards**: Protegen rutas (`CanActivate`, `CanDeactivate`)
- **Interceptores**: Enriquecen requests/responses HTTP
- **Modelos**: Interfaces compartidas de toda la app

## Guards

```typescript
// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivateFn {
  constructor(private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.authService.isAuthenticated() ? true : this.router.parseUrl('/login');
  }
}
```

## Interceptores

```typescript
// error.interceptor.ts
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle error centrally
        console.error(error);
        return throwError(() => error);
      })
    );
  }
}
```

## Servicios

```typescript
// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{ user: User; token: string }>('/api/auth/login', {
      email,
      password
    }).pipe(
      tap(res => this.currentUser$.next(res.user)),
      map(res => res.token)
    );
  }

  isAuthenticated() {
    return !!this.currentUser$.value;
  }

  getCurrentUser() {
    return this.currentUser$.asObservable();
  }
}
```

## Imports desde otras capas

```typescript
// Desde feature
import { AuthService, AuthGuard } from '@app/core';
import { User } from '@app/core';
```

## No permitido

```typescript
// ❌ NO importar internos de core
import { AuthService } from '@app/core/services/auth.service';

// ✓ Usar barrel: import { AuthService } from '@app/core';
```

