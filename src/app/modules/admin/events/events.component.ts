import { Component, OnInit, ViewChild } from '@angular/core';
import { Event, Slot } from '../../../services/event.service';
import { EventService } from '../../../services/event.service';
import { AlertController, IonModal } from '@ionic/angular';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {
  @ViewChild('eventModal', { static: true }) eventModal!: IonModal;

  events: Event[] = [];
  newEvent!: Event;
  editMode = false;
  selectedEventId: string | null = null;
  isModalOpen = false;

  constructor(
    private eventService: EventService,
    private alertController: AlertController
  ) {
    this.resetNewEvent();
  }

  ngOnInit() {
    this.fetchEvents();
  }

  resetNewEvent() {
    const currentDate = new Date().toISOString().split('T')[0];
    this.newEvent = {
      name: '',
      startDate: currentDate,
      endDate: currentDate,
      description: '',
      slots: [] 
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

  addSlot() {
    if (!this.newEvent.slots) {
      this.newEvent.slots = [];
    }
    const slotId = `slot${this.newEvent.slots.length + 1}`;
    this.newEvent.slots.push({
      slotId,
      startDate: this.newEvent.startDate,
      endDate: this.newEvent.endDate,
    });
  }
  

  removeSlot(index: number) {
    this.newEvent.slots?.splice(index, 1);
  }

  async addEvent() {
    if (!this.validateEvent()) return;

    this.eventService.addEvent(this.newEvent).subscribe(() => {
      this.fetchEvents();
      this.closeEventModal();
    });
  }

  validateEvent(): boolean {
    if (!this.newEvent.name || !this.newEvent.startDate || !this.newEvent.endDate || !this.newEvent.description) {
      this.showAlert('Validation Error', 'All fields are required.');
      return false;
    }

    if (new Date(this.newEvent.startDate) > new Date(this.newEvent.endDate)) {
      this.showAlert('Validation Error', 'Start date must be before end date.');
      return false;
    }

    for (const slot of this.newEvent.slots || []) {
      if (new Date(slot.startDate) < new Date(this.newEvent.startDate) ||
          new Date(slot.endDate) > new Date(this.newEvent.endDate)) {
        this.showAlert('Validation Error', 'Slots must be within the event date range.');
        return false;
      }

      if (new Date(slot.startDate) > new Date(slot.endDate)) {
        this.showAlert('Validation Error', 'Slot start date must be before slot end date.');
        return false;
      }
    }

    return true;
  }

  openEventModal(event?: Event) {
    if (event) {
      this.editMode = true;
      this.selectedEventId = event.eventId!;
      this.newEvent = { ...event };
    } else {
      this.editMode = false;
      this.resetNewEvent();
    }
    this.isModalOpen = true;
  }

  closeEventModal() {
    this.isModalOpen = false;
    this.resetNewEvent();
  }

  editEvent(event: Event) {
    this.openEventModal(event);
  }

  updateEvent() {
    if (!this.validateEvent()) return;

    if (this.selectedEventId) {
      const updatedEvent = { ...this.newEvent, eventId: this.selectedEventId };
      this.eventService.updateEvent(updatedEvent).subscribe(() => {
        this.fetchEvents();
        this.closeEventModal();
      });
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

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
