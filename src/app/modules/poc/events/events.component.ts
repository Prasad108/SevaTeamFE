import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../services/event.service';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchEvents();
  }

  fetchEvents() {
    this.eventService.getEvents().subscribe(
      (events) => {
        this.events = events;
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.showAlert('Error', 'Failed to load events.');
      }
    );
  }

  refreshEvents() {
    this.fetchEvents();
  }

  updateVolunteersForEvent(event: Event) {
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
