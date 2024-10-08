import { Component, OnInit, ViewChild } from '@angular/core';
import { Event, Slot } from '../../../services/event.service';
import { EventService } from '../../../services/event.service';
import { AlertController, IonModal } from '@ionic/angular';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { AnalyticsService } from 'src/app/services/analytics.service';  // Import the AnalyticsService

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss'],
})
export class EventsComponent implements OnInit {

  newEvent: Event = {
    name: '',
    startDate: '',
    endDate: '',
    description: '',
    slots: [],
    registrationStartDate: '',
    registrationEndDate: '',
    locationDetails: '',
    eventManagerName: '',
    eventManagerContactNumber: '',
    eventManagerEmailId: '',
  };
  
  @ViewChild('eventModal', { static: true }) eventModal!: IonModal;

  events: Event[] = [];
  newSlot: Slot = { slotId: '', startDate: '', endDate: '' };
  editMode = false;
  selectedEventId: string | null = null;
  isModalOpen = false;
  today = new Date().toISOString(); 


  constructor(
    private eventService: EventService,
    private alertController: AlertController,
    private confirmationDialogService: ConfirmationDialogService,
    private analyticsService: AnalyticsService  // Inject the AnalyticsService
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
      slots: [],
      registrationStartDate: currentDate,
      registrationEndDate: currentDate,
      locationDetails: '',
      eventManagerName: '',
      eventManagerContactNumber: '',
      eventManagerEmailId: '',
    };
    this.newSlot = { slotId: '', startDate: '', endDate: '' };
  }

  fetchEvents() {
    this.eventService.getEvents().subscribe(
      (events) => {
        this.events = events;
        this.analyticsService.logCustomEvent('admin_fetch_events_success');  // Log fetch events success
      },
      (error) => {
        console.error('Error fetching events:', error);
        this.analyticsService.logCustomEvent('admin_fetch_events_error', { error: error.message });  // Log fetch events error
        this.showAlert('Error', 'Failed to load events.');
      }
    );
  }

  addSlot() {
    if (!this.validateSlot()) return;

    const slotId = `Slot-${this.newEvent.slots!.length + 1}`;
    this.newEvent.slots?.push({
      slotId,
      startDate: this.newSlot.startDate,
      endDate: this.newSlot.endDate,
    });

    this.newSlot = { slotId: '', startDate: '', endDate: '' }; // Reset slot fields
    this.showAlert('Success', 'Slot added successfully!');
    this.analyticsService.logCustomEvent('admin_slot_added', { slotId });  // Log slot added
  }

  removeSlot(index: number) {
    this.newEvent.slots?.splice(index, 1);
    this.analyticsService.logCustomEvent('admin_slot_removed', { index });  // Log slot removed
  }

  onEventDateChange() {
    if (this.newEvent.slots && this.newEvent.slots.length === 0) {
      this.newSlot.startDate = this.newEvent.startDate;
      this.newSlot.endDate = this.newEvent.endDate;
    }
  }

  async addEvent() {
    if (!this.validateEvent()) return;

    this.eventService.addEvent(this.newEvent).subscribe(() => {
      this.fetchEvents();
      this.closeEventModal();
      this.analyticsService.logCustomEvent('admin_event_added', { eventName: this.newEvent.name });  // Log event added
    });
  }

  validateSlot(): boolean {
    const slotStartDate = new Date(this.newSlot.startDate);
    const eventStartDate = new Date(this.newEvent.startDate);
    const slotEndDate = new Date(this.newSlot.endDate);
    const eventEndDate = new Date(this.newEvent.endDate);
  
    if (isNaN(slotStartDate.getTime()) || isNaN(eventStartDate.getTime()) || isNaN(slotEndDate.getTime()) || isNaN(eventEndDate.getTime())) {
      this.showAlert('Validation Error', 'Please select valid slot dates.');
      return false;
    }
  
    if (slotStartDate < eventStartDate || slotEndDate > eventEndDate) {
      this.showAlert('Validation Error', 'Slot dates must be within the event date range.');
      return false;
    }
  
    if (slotStartDate > slotEndDate) {
      this.showAlert('Validation Error', 'Slot start date must be before slot end date.');
      return false;
    }
  
    return true;
  }

  validateEvent(): boolean {
    if (!this.newEvent.name || !this.newEvent.startDate || !this.newEvent.endDate || !this.newEvent.description || 
        !this.newEvent.registrationStartDate || !this.newEvent.registrationEndDate || !this.newEvent.locationDetails ||
        !this.newEvent.eventManagerName || !this.newEvent.eventManagerContactNumber || !this.newEvent.eventManagerEmailId) {
      this.showAlert('Validation Error', 'All fields are required.');
      return false;
    }

    if (new Date(this.newEvent.startDate) > new Date(this.newEvent.endDate)) {
      this.showAlert('Validation Error', 'Start date must be before end date.');
      return false;
    }

    if (new Date(this.newEvent.registrationStartDate) > new Date(this.newEvent.registrationEndDate)) {
      this.showAlert('Validation Error', 'Registration start date must be before registration end date.');
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
        this.analyticsService.logCustomEvent('admin_event_updated', { eventId: this.selectedEventId });  // Log event updated
      });
    }
  }

  async deleteEvent(eventId: string) {
    const confirmed = await this.confirmationDialogService.confirmDelete();

    if (confirmed) {
      try {
        await this.eventService.deleteEvent(eventId);
        this.events = this.events.filter((event) => event.eventId !== eventId);
        this.analyticsService.logCustomEvent('admin_event_deleted', { eventId });  // Log event deleted
      } catch (error) {
        console.error('Error deleting event:', error);
        this.analyticsService.logCustomEvent('admin_event_delete_error', { error: error, eventId });  // Log event delete error
        this.showAlert('Error', 'Failed to delete event.');
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  getModalStyles() {
    if (window.innerWidth >= 768) { // Desktop breakpoint
      return {
        '--width': '60vw',
        '--height': '80vh'
      };
    } else {
      return {}; // No additional styles for mobile
    }
  }
}
