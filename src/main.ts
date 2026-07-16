import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RootComponent } from './app/root.component';
import { interceptorAutenticacion } from './app/nucleo/auth/interceptor-autenticacion';

// Arranque de la aplicación standalone con proveedores globales
bootstrapApplication(RootComponent, {
  providers: [
    provideRouter([{ path: 'login', children: [] }]),
    provideHttpClient(withInterceptors([interceptorAutenticacion])),
  ],
}).catch(err => console.error('Error al arrancar la aplicación:', err));
