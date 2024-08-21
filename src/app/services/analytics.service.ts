import { Analytics, getAnalytics, logEvent } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  analytics:Analytics;
  constructor() {
    const analytics = getAnalytics();
    this.analytics = analytics;
  }
  logCustomEvent(eventName: string, eventParams?: { [key: string]: any }) {
    if (eventParams) {
      logEvent(this.analytics, eventName, eventParams);
    } else {
      logEvent(this.analytics, eventName);
    }
  }
}
