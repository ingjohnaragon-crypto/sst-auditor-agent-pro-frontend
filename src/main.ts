import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { RootComponent } from './app/root.component';

// Arranque de la aplicación standalone con proveedores globales
bootstrapApplication(RootComponent, {
  providers: [
    provideRouter([]),
    provideHttpClient(),
  ],
}).catch(err => console.error('Error al arrancar la aplicación:', err));
