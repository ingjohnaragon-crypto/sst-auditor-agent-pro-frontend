# Shared Layer

Componentes, pipes y directivas reutilizables sin lógica de negocio.

## Estructura

```
shared/
├── components/          # Botones, modales, spinners, etc
├── pipes/               # Date, currency, truncate, etc
├── directives/          # Focus, permissions, etc
└── index.ts             # Barrel file
```

## Características

- **Componentes dumb**: Solo `@Input` y `@Output`
- **Sin servicios**: No inyectan AuthService, HttpClient, etc
- **Reutilizables**: Usables en múltiples features
- **OnPush**: Todos con `ChangeDetectionStrategy.OnPush`
- **Typed Forms**: Formularios fuertemente tipados

## Componentes

### ButtonComponent

```typescript
@Component({
  selector: 'app-button',
  template: `<button (click)="onClick()">{{ label }}</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() label!: string;
  @Input() disabled = false;
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Output() clicked = new EventEmitter<void>();

  onClick() {
    if (!this.disabled) {
      this.clicked.emit();
    }
  }
}
```

### ModalComponent

```typescript
@Component({
  selector: 'app-modal',
  template: `
    <div class="modal" *ngIf="isOpen">
      <div class="modal-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
}
```

## Pipes

```typescript
// safe-html.pipe.ts
@Pipe({
  name: 'safeHtml',
  standalone: true
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string) {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}

// truncate.pipe.ts
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50): string {
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }
}
```

## Directivas

```typescript
// has-permission.directive.ts
@Directive({
  selector: '[appHasPermission]',
  standalone: true
})
export class HasPermissionDirective {
  constructor(private templateRef: TemplateRef<any>, private viewContainer: ViewContainerRef) {}

  @Input() set appHasPermission(permission: string) {
    // Check if user has permission
    // If yes, show element; if no, hide
  }
}

// focus.directive.ts
@Directive({
  selector: '[appFocus]',
  standalone: true
})
export class FocusDirective implements AfterViewInit {
  constructor(private elementRef: ElementRef) {}

  ngAfterViewInit() {
    this.elementRef.nativeElement.focus();
  }
}
```

## Imports desde otras capas

```typescript
// Desde feature
import { ButtonComponent, SafeHtmlPipe } from '@app/shared';

// O más específico
import { ButtonComponent } from '@app/shared/components';
```

## No permitido

```typescript
// ❌ NO importar componentes internos
import { ButtonComponent } from '@app/shared/components/button';

// ✓ Usar barrel: import { ButtonComponent } from '@app/shared';
```

## Reglas

- ❌ NO inyectar servicios de core
- ❌ NO hacer HTTP calls
- ❌ NO acceder a localStorage/sessionStorage
- ✓ SÍ recibir datos vía @Input
- ✓ SÍ emitir eventos vía @Output
- ✓ SÍ usar pipes y directivas

