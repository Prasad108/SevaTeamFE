import { Analytics, getAnalytics, logEvent } from '@angular/fire/analytics';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private analytics: Analytics;

  constructor() {
    this.analytics = getAnalytics(); // Initialize the analytics instance once
  }

  logCustomEvent(eventName: string, eventParams?: { [key: string]: any }) {
    logEvent(this.analytics, eventName, eventParams || {});
  }
}
