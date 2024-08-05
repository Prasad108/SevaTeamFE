import { Component, OnInit } from '@angular/core';
import { Event } from '../../../services/event.service';
import { EventService } from '../../../services/event.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  newEvent!: Event;
  editMode = false;
  selectedEventId: string | null = null;

  constructor(
    private eventService: EventService,
    private alertController: AlertController
  ) {
    this.resetNewEvent();
  }

  ngOnInit() {
    this.fetchEvents();
  }

  // Initialize a new event with default dates
  resetNewEvent() {
    const currentDate = new Date().toISOString().split('T')[0]; // Format to YYYY-MM-DD
    this.newEvent = {
      name: '',
      startDate: currentDate,
      endDate: currentDate,
      description: ''
    };
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

  async addEvent() {
    if (!this.newEvent.name || !this.newEvent.startDate || !this.newEvent.endDate || !this.newEvent.description) {
      await this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    // Ensure start date is before end date
    if (new Date(this.newEvent.startDate) > new Date(this.newEvent.endDate)) {
      await this.showAlert('Validation Error', 'Start date must be before end date.');
      return;
    }

    this.eventService.addEvent(this.newEvent).subscribe(() => {
      this.fetchEvents();
      this.resetNewEvent();
    });
  }

  editEvent(event: Event) {
    this.editMode = true;
    this.selectedEventId = event.eventId!;
    this.newEvent = { ...event };
  }

  updateEvent() {
    if (!this.newEvent.name || !this.newEvent.startDate || !this.newEvent.endDate || !this.newEvent.description) {
      this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    if (new Date(this.newEvent.startDate) > new Date(this.newEvent.endDate)) {
      this.showAlert('Validation Error', 'Start date must be before end date.');
      return;
    }

    if (this.selectedEventId) {
      const updatedEvent = { ...this.newEvent, eventId: this.selectedEventId };
      this.eventService.updateEvent(updatedEvent).subscribe(() => {
        this.fetchEvents();
        this.cancelEdit();
      });
    } else {
      this.showAlert('Error', 'No event selected for update.');
    }
  }

  async deleteEvent(eventId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this event?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.eventService.deleteEvent(eventId);
              this.events = this.events.filter((event) => event.eventId !== eventId);
            } catch (error) {
              console.error('Error deleting event:', error);
              this.showAlert('Error', 'Failed to delete event.');
            }
          },
        },
      ],
    });

    await alert.present();
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedEventId = null;
    this.resetNewEvent(); // Reset the new event to default dates
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
