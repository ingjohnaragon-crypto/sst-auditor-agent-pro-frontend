import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { rutasApp } from './app/app.routes';
import { interceptorAutenticacion } from './app/nucleo/auth/interceptor-autenticacion';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(rutasApp),
    provideHttpClient(withInterceptors([interceptorAutenticacion])),
  ],
}).catch((err) => console.error('Error al arrancar la aplicación:', err));
