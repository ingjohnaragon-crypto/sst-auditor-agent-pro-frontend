import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { RootComponent } from './app/root.component';
import { HttpClientModule } from '@angular/common/http';

// Arranque de la aplicación standalone con proveedores globales
bootstrapApplication(RootComponent, {
  providers: [
    provideRouter([]),
    importProvidersFrom(HttpClientModule),
  ],
}).catch(err => console.error('Error al arrancar la aplicación:', err));
