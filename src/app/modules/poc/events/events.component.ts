import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../services/event.service';
import { Event } from '../../../services/event.service';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  volunteers: Volunteer[] = [];
  selectedEvent: Event | null = null;
  centerId: string | null = null;

  constructor(
    private eventService: EventService,
    private volunteerService: VolunteerService,
    private alertController: AlertController,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.centerId = user.uid; // Assuming the centerId is stored in the user's UID for simplicity
        this.fetchEvents();
        this.fetchVolunteers();
      }
    });
  }

  fetchEvents() {
    this.eventService.getEvents().subscribe(events => {
      this.events = events;
    });
  }

  fetchVolunteers() {
    if (this.centerId) {
      this.volunteerService.getVolunteersByCenter(this.centerId).subscribe(volunteers => {
        this.volunteers = volunteers.filter(volunteer => volunteer.status === 'approved');
      });
    }
  }

  selectEvent(event: Event) {
    this.selectedEvent = event;
  }

  // async assignVolunteer(volunteer: Volunteer) {
  //   if (this.selectedEvent) {
  //     // Ensure volunteers object exists
  //     if (!this.selectedEvent.volunteers) {
  //       this.selectedEvent.volunteers = {};
  //     }

  //     // Assign volunteer to event
  //     this.selectedEvent.volunteers[volunteer.volunteerId!] = {
  //       centerId: volunteer.centerId,
  //       adminActions: { ineligible: false, comment: '' }
  //     };

  //     // Update the event with the new volunteer assignment
  //     this.eventService.updateEvent(this.selectedEvent).subscribe(() => {
  //       this.showAlert('Success', 'Volunteer assigned to event.');
  //       this.selectedEvent = null; // Reset selection after assignment
  //     });
  //   }
  // }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}