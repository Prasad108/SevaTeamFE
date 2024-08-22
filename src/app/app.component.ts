import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AnalyticsService } from './services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor(private analyticsService: AnalyticsService) {
    this.logAppStart();
  }

  private logAppStart() {
    this.analyticsService.logCustomEvent('app_start');
  }
}
