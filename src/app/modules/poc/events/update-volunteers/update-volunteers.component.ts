import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../../../services/volunteer.service';
import { Volunteer } from '../../../../services/volunteer.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { EventService, Event } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
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
  isRegistrationFuture: boolean = false;
  isRegistrationClosed: boolean = false;

  isSlotSelectionOpen: boolean = false;
  slotSelection: { [slotId: string]: boolean } = {};
  currentVolunteer: Volunteer | null = null;

  isEditModalOpen: boolean = false; // Track the edit modal state
  currentAssignment: EventVolunteerAssignment | null = null; // Current assignment being edited

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
        this.checkRegistrationDates();
        if (!this.isRegistrationFuture) {
          this.initializeData();
        }
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  checkRegistrationDates() {
    const now = new Date().getTime();
    const registrationStart = new Date(this.selectedEvent?.registrationStartDate || '').getTime();
    const registrationEnd = new Date(this.selectedEvent?.registrationEndDate || '').getTime();

    this.isRegistrationFuture = registrationStart > now;
    this.isRegistrationClosed = registrationEnd < now;
  }

  async initializeData() {
    const poc = this.storageService.getStoredPocDetails();
    if (poc) {
      this.centerId = poc.centerId;
      this.pocId = poc.pocId ?? null;
      this.fetchVolunteers();
      if (this.selectedEvent) {
        this.fetchAssignedVolunteersForThisCenter(this.selectedEvent.eventId!, this.centerId);
      }
    }
  }

  fetchVolunteers() {
    if (this.centerId) {
      this.volunteerService.getVolunteersByCenter(this.centerId).subscribe(volunteers => {
        this.allVolunteersOfCenter = volunteers;
        this.availableVolunteers = this.allVolunteersOfCenter.filter(volunteer => {
          return  volunteer.status === 'approved' && !this.assignedVolunteers.some(assignedVolunteer => assignedVolunteer.volunteerId === volunteer.volunteerId);
        });
      });
    }
  }

  fetchAssignedVolunteersForThisCenter(eventId: string, centerId: string) {
    this.assignmentService.getAssignmentsForEventByCenter(centerId, eventId).subscribe(assignments => {
      this.assignedVolunteers = assignments;
      this.availableVolunteers = this.allVolunteersOfCenter.filter(volunteer => {
        return volunteer.status === 'approved' && !this.assignedVolunteers.some(assignedVolunteer => assignedVolunteer.volunteerId === volunteer.volunteerId);
      });
    });
  }

  onAddVolunteer(volunteer: Volunteer) {
    this.currentVolunteer = volunteer;

    if (this.selectedEvent?.slots && this.selectedEvent.slots.length > 1) {
      // If there are multiple slots, open the slot selection modal
      this.isSlotSelectionOpen = true;
      this.slotSelection = {};
      this.selectedEvent.slots.forEach(slot => {
        this.slotSelection[slot.slotId] = false;
      });
    } else if (this.selectedEvent?.slots && this.selectedEvent.slots.length === 1) {
      // If there is only one slot, automatically select it
      this.addVolunteerToEvent(volunteer, [this.selectedEvent.slots[0].slotId]);
    } else {
      this.showAlert('Error', 'No slots available for this event.');
    }
  }

  async confirmSlotSelection() {
    const selectedSlots = Object.keys(this.slotSelection).filter(slotId => this.slotSelection[slotId]);
    if (selectedSlots.length === 0) {
      this.showAlert('Error', 'Please select at least one slot.');
      return;
    }

    this.isSlotSelectionOpen = false;
    if (this.currentVolunteer) {
      this.addVolunteerToEvent(this.currentVolunteer, selectedSlots);
    }
  }

  async addVolunteerToEvent(volunteer: Volunteer, selectedSlots: string[]) {
    if (this.isRegistrationClosed) return;

    const loading = await this.loadingController.create({ message: 'Adding Volunteer...' });
    await loading.present();

    const newAssignment: EventVolunteerAssignment = {
      volunteerId: volunteer.volunteerId!,
      eventId: this.selectedEvent!.eventId!,
      centerId: this.centerId!,
      pocId: this.pocId!,
      adminApprovalStatus: 'review-pending',
      adminComment: '',
      volunteerArrivalDate: null,
      pocComment: '',
      slotsSelected: selectedSlots,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.assignmentService.addAssignment(newAssignment).subscribe((createdAssignment) => {
      this.assignedVolunteers.push(createdAssignment);
      this.availableVolunteers = this.availableVolunteers.filter(v => v.volunteerId !== volunteer.volunteerId);
      loading.dismiss();
    }, error => {
      loading.dismiss();
      console.log(error);
      this.showAlert('Error', 'Failed to add volunteer to event.');
    });
  }

  async removeVolunteerFromEvent(assignment: EventVolunteerAssignment) {
    if (this.isRegistrationClosed) return;

    const loading = await this.loadingController.create({ message: 'Removing Volunteer...' });
    await loading.present();

    this.assignmentService.deleteAssignment(assignment.id!).subscribe(() => {
      this.assignedVolunteers = this.assignedVolunteers.filter(av => av.id !== assignment.id);
      const volunteer = this.allVolunteersOfCenter.find(v => v.volunteerId === assignment.volunteerId);
      if (volunteer && volunteer.status ==='approved') {
        this.availableVolunteers.push(volunteer);
      }
      loading.dismiss();
    }, error => {
      loading.dismiss();
      this.showAlert('Error', 'Failed to remove volunteer from event.');
    });
  }

  openEditAssignmentModal(assignment: EventVolunteerAssignment) {
    this.currentAssignment = { ...assignment };
    this.isEditModalOpen = true;
  }

  closeEditAssignmentModal() {
    this.isEditModalOpen = false;
    this.currentAssignment = null;
  }

async saveUpdatedAssignment() {
  if (!this.currentAssignment) return;

  const loading = await this.loadingController.create({ message: 'Updating Assignment...' });
  await loading.present();



  this.currentAssignment.updatedAt = new Date().toISOString();

  this.assignmentService.updateAssignment(this.currentAssignment).subscribe((updatedAssignment) => {
    loading.dismiss();
    this.closeEditAssignmentModal();

    // Find the index of the updated assignment in the assignedVolunteers array
    const index = this.assignedVolunteers.findIndex(a => a.id === updatedAssignment.id);

    // If the assignment is found, update it in the array
    if (index !== -1) {
      this.assignedVolunteers[index] = updatedAssignment;
    }
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

  onSlotSelectionClose() {
    this.isSlotSelectionOpen = false;
  }
}
