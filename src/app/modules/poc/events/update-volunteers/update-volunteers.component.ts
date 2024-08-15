import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../../../services/volunteer.service';
import { Volunteer } from '../../../../services/volunteer.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { AlertController,LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { EventService, Event } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { Timestamp } from 'firebase/firestore';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-update-volunteers',
  templateUrl: './update-volunteers.component.html',
  styleUrls: ['./update-volunteers.component.scss'],
})
export class UpdateVolunteersComponent implements OnInit {
  allVolunteersOfCenter: Volunteer[] = [];
  availableVolunteers: Volunteer[] = [];
  assignedVolunteers: EventVolunteerAssignment[] = [];
  selectedEvent: Event | null = null;
  centerId: string | null = null;
  pocId: string | null = null;
  eventId: string | null = null;


  constructor(
    private volunteerService: VolunteerService,
    private assignmentService: EventVolunteerAssignmentService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private storageService: StorageService,
    private eventService: EventService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.eventId = this.route.snapshot.paramMap.get('eventId');
    if (this.eventId) {
      this.fetchEventDetails(this.eventId);
    }
 
  }

  fetchEventDetails(eventId: string) {
    this.eventService.getEventById(eventId).subscribe(
      (event) => {
        this.selectedEvent = event;
        this.initializeData();
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  async initializeData() {
    const poc = this.storageService.getStoredPocDetails();
    if (poc) {
      this.centerId = poc.centerId;
      this.pocId = poc.pocId ?? null;
      this.fetchVolunteers();
      if (this.selectedEvent) {
        this.fetchAssignedVolunteersForThisCenter(this.selectedEvent.eventId!,this.centerId);
      }
    }
  }

  fetchVolunteers() {
    if (this.centerId) {
      this.volunteerService.getVolunteersByCenter(this.centerId).subscribe(volunteers => {
        this.allVolunteersOfCenter = volunteers;
      });
    }
  }

  fetchAssignedVolunteersForThisCenter(eventId: string, centerId: string) {
    this.assignmentService.getAssignmentsForEventByCenter(centerId,eventId).subscribe(assignments => {
      this.assignedVolunteers = assignments;
      this.availableVolunteers = this.allVolunteersOfCenter.filter(volunteer => {
        return !this.assignedVolunteers.some(assignedVolunteer => assignedVolunteer.volunteerId === volunteer.volunteerId);
      });


    });
  }

  async addVolunteerToEvent(volunteer: Volunteer) {
    const loading = await this.loadingController.create({ message: 'Adding Volunteer...' });
    await loading.present();

    const newAssignment: EventVolunteerAssignment = {
      volunteerId: volunteer.volunteerId!,
      eventId: this.selectedEvent!.eventId!,
      centerId: this.centerId!,
      pocId: this.pocId!,
      adminApprovalStatus: 'pending',
      adminComment: '',
      volunteerArrivalDate: Timestamp.fromDate(new Date()),
      pocComment: '',
      slotsSelected: [],
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    };

    this.assignmentService.addAssignment(newAssignment).subscribe((createdAssignment) => {
      this.assignedVolunteers.push(createdAssignment);
      this.availableVolunteers = this.availableVolunteers.filter(v => v.volunteerId !== volunteer.volunteerId);
      loading.dismiss();
    }, error => {
      loading.dismiss();
      console.log(error)
      this.showAlert('Error', 'Failed to add volunteer to event.');
    });
  }

  async removeVolunteerFromEvent(assignment: EventVolunteerAssignment) {
    console.log(assignment)
    const loading = await this.loadingController.create({ message: 'Removing Volunteer...' });
    await loading.present();

    this.assignmentService.deleteAssignment(assignment.id!).subscribe(() => {
      this.assignedVolunteers = this.assignedVolunteers.filter(av => av.id !== assignment.id);
      const volunteer = this.allVolunteersOfCenter.find(v => v.volunteerId === assignment.volunteerId);
      if (volunteer) {
        this.availableVolunteers.push(volunteer);
      }
      loading.dismiss();
    }, error => {
      loading.dismiss();
      this.showAlert('Error', 'Failed to remove volunteer from event.');
    });
  }

  async updateVolunteerAssignment(assignment: EventVolunteerAssignment) {
    const loading = await this.loadingController.create({ message: 'Updating Assignment...' });
    await loading.present();

    assignment.updatedAt = Timestamp.fromDate(new Date());

    this.assignmentService.updateAssignment(assignment).subscribe(() => {
      loading.dismiss();
    }, error => {
      loading.dismiss();
      this.showAlert('Error', 'Failed to update volunteer assignment.');
    });
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  getVolunteerName(volunteerId: string): string {
    const volunteer = this.allVolunteersOfCenter.find(v => v.volunteerId === volunteerId);
    return volunteer ? volunteer.name : 'Unknown';
  }
  
}