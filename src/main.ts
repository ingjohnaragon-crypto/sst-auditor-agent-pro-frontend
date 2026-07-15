import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RootComponent } from './app/root.component';

bootstrapApplication(RootComponent, {
  providers: [provideRouter([])],
}).catch(err => console.error(err));
