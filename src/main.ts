import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeFirebase } from './firebase-config';
import { registerIcons } from './app/icons';
import { importProvidersFrom } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ScreenTrackingService, UserTrackingService } from '@angular/fire/analytics';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

registerIcons();

bootstrapApplication(AppComponent, {
  providers: [
    ...initializeFirebase,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicModule.forRoot({})),
    { provide: LocationStrategy, useClass: HashLocationStrategy },

    ScreenTrackingService,
    UserTrackingService,
  ],
});
