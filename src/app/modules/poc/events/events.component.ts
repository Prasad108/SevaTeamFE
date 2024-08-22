import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../services/event.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service'; // Import your AnalyticsService

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];

  constructor(
    private eventService: EventService,
    private alertController: AlertController,
    private router: Router,
    private analyticsService: AnalyticsService // Inject your AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('events_component_viewed'); // Log when component is initialized
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventService.getEvents().subscribe(
      (events) => {
        this.events = events;
        this.analyticsService.logCustomEvent('events_fetched', { eventCount: events.length }); // Log fetching events
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.analyticsService.logCustomEvent('events_fetch_error', { error: error.message }); // Log error during fetch
        this.showAlert('Error', 'Failed to load events.');
      }
    );
  }

  refreshEvents() {
    this.analyticsService.logCustomEvent('events_refreshed'); // Log when events are refreshed
    this.fetchEvents();
  }

  updateVolunteersForEvent(event: Event) {
    this.analyticsService.logCustomEvent('volunteer_update_navigation', { eventId: event.eventId }); // Log navigation to update volunteers
    this.router.navigate(['/poc/events', event.eventId, 'volunteers']);
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
