import { Component, OnInit } from '@angular/core';
import { VolunteerService, Volunteer } from '../../../../services/volunteer.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { AlertController, LoadingController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { EventService, Event } from 'src/app/services/event.service';
import { StorageService } from 'src/app/services/storage.service';
import { ActivatedRoute } from '@angular/router';
import { Center, CenterService } from 'src/app/services/center.service';
import { POC, PocService } from 'src/app/services/poc.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics.service'; // Import your AnalyticsService

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
  center: Center | null = null;
  poc: Omit<POC, 'authId' | 'role' | 'initialPassword'> | null = null;
  centerId: string | null = null;
  pocId: string | null = null;
  eventId: string | null = null;
  isRegistrationFuture: boolean = false;
  isRegistrationClosed: boolean = false;

  isSlotSelectionOpen: boolean = false;
  slotSelection: { [slotId: string]: boolean } = {};
  currentVolunteer: Volunteer | null = null;

  isEditModalOpen: boolean = false;
  currentAssignment: EventVolunteerAssignment | null = null;

  constructor(
    private volunteerService: VolunteerService,
    private assignmentService: EventVolunteerAssignmentService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private storageService: StorageService,
    private eventService: EventService,
    private route: ActivatedRoute,
    private centerService: CenterService,
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService // Inject your AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('update_volunteers_component_viewed'); // Log when component is initialized

    this.eventId = this.route.snapshot.paramMap.get('eventId');
    if (this.eventId) {
      this.fetchEventDetails(this.eventId);
    }
  }

  fetchEventDetails(eventId: string) {
    this.eventService.getEventById(eventId).subscribe(
      (event) => {
        this.selectedEvent = event;
        this.analyticsService.logCustomEvent('event_details_fetched', { eventId }); // Log fetching event details
        this.checkRegistrationDates();
        if (!this.isRegistrationFuture) {
          this.initializeData();
        }
      },
      (error) => {
        console.error('Error fetching event details:', error);
        this.analyticsService.logCustomEvent('event_details_fetch_error', { eventId, error: error.message }); // Log error during fetch
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
      this.poc = poc;
      this.centerService.getCenterById(this.centerId).subscribe(center => {
        if (center) {
          this.center = center;
        }
      });
      this.fetchVolunteers();
      if (this.selectedEvent) {
        this.fetchAssignedVolunteersForThisCenter(this.centerId, this.selectedEvent.eventId!);
      }
    }
  }

  fetchVolunteers() {
    if (this.centerId) {
      this.volunteerService.getVolunteersByCenter(this.centerId!).subscribe(volunteers => {
        this.allVolunteersOfCenter = volunteers;
        this.updateVolunteerLists();
        this.analyticsService.logCustomEvent('volunteers_fetched', { centerId: this.centerId, volunteerCount: volunteers.length }); // Log fetching volunteers
      });
    }
  }

  fetchAssignedVolunteersForThisCenter(centerId: string, eventId: string) {
    this.assignmentService.getAssignmentsForEventByCenter(centerId, eventId).subscribe(assignments => {
      this.assignedVolunteers = assignments;
      this.updateVolunteerLists();
      this.analyticsService.logCustomEvent('assigned_volunteers_fetched', { centerId, eventId, assignmentCount: assignments.length }); // Log fetching assigned volunteers
    });
  }

  updateVolunteerLists() {
    this.availableVolunteers = this.allVolunteersOfCenter.filter(volunteer => {
      return volunteer.status === 'approved' &&
        !this.assignedVolunteers.some(assignedVolunteer => assignedVolunteer.volunteer.volunteerId === volunteer.volunteerId);
    });
    this.cdr.detectChanges(); // Force change detection
  }

  onAddVolunteer(volunteer: Volunteer) {
    this.currentVolunteer = volunteer;
    if (this.selectedEvent?.slots && this.selectedEvent.slots.length > 1) {
      this.isSlotSelectionOpen = true;
      this.slotSelection = {};
      this.selectedEvent.slots.forEach(slot => {
        this.slotSelection[slot.slotId] = false;
      });
    } else if (this.selectedEvent?.slots && this.selectedEvent.slots.length === 1) {
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
        volunteer,
        eventId: this.selectedEvent!.eventId!,
        center: this.center!,
        poc: this.poc!,
        adminApprovalStatus: 'review-pending',
        adminComment: '',
        volunteerArrivalDate: null,
        pocComment: '',
        slotsSelected: selectedSlots,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    this.assignmentService.addAssignment(newAssignment).subscribe(
        (createdAssignment) => {
            // Add the newly created assignment to the assigned volunteers list
            this.assignedVolunteers.push(createdAssignment);

            // Remove the added volunteer from the available volunteers list
            this.availableVolunteers = this.availableVolunteers.filter(v => v.volunteerId !== volunteer.volunteerId);

            // Log volunteer assignment
            this.analyticsService.logCustomEvent('volunteer_assigned', { volunteerId: volunteer.volunteerId, eventId: this.selectedEvent!.eventId });

            // Force change detection to update the UI
            this.cdr.detectChanges();

            loading.dismiss();
        },
        error => {
            loading.dismiss();
            this.analyticsService.logCustomEvent('volunteer_assignment_error', { volunteerId: volunteer.volunteerId, eventId: this.selectedEvent!.eventId, error: error.message }); // Log error during assignment
            this.showAlert('Error', 'Failed to add volunteer to event.');
        }
    );
  }

  async removeVolunteerFromEvent(assignment: EventVolunteerAssignment) {
    if (this.isRegistrationClosed) return;

    const loading = await this.loadingController.create({ message: 'Removing Volunteer...' });
    await loading.present();

    this.assignmentService.deleteAssignment(assignment.id!).subscribe(() => {
      this.assignedVolunteers = this.assignedVolunteers.filter(av => av.id !== assignment.id);
      this.updateVolunteerLists(); // Update lists after removing

      // Log volunteer removal
      this.analyticsService.logCustomEvent('volunteer_removed', { volunteerId: assignment.volunteer.volunteerId, eventId: assignment.eventId });

      loading.dismiss();
    }, error => {
      loading.dismiss();
      this.analyticsService.logCustomEvent('volunteer_removal_error', { volunteerId: assignment.volunteer.volunteerId, eventId: assignment.eventId, error: error.message }); // Log error during removal
      this.showAlert('Error', 'Failed to remove volunteer from event.');
    });
  }

  openEditAssignmentModal(assignment: EventVolunteerAssignment) {
    this.currentAssignment = { ...assignment };
    this.isEditModalOpen = true;
    this.analyticsService.logCustomEvent('edit_assignment_modal_opened', { assignmentId: assignment.id }); // Log opening of edit assignment modal
  }

  closeEditAssignmentModal() {
    this.isEditModalOpen = false;
    this.currentAssignment = null;
    this.analyticsService.logCustomEvent('edit_assignment_modal_closed'); // Log closing of edit assignment modal
  }

  async saveUpdatedAssignment() {
    if (!this.currentAssignment) return;

    const loading = await this.loadingController.create({ message: 'Updating Assignment...' });
    await loading.present();

    this.currentAssignment.updatedAt = new Date().toISOString();

    this.assignmentService.updateAssignment(this.currentAssignment).subscribe((updatedAssignment) => {
      loading.dismiss();
      this.closeEditAssignmentModal();

      const index = this.assignedVolunteers.findIndex(a => a.id === updatedAssignment.id);
      if (index !== -1) {
        this.assignedVolunteers[index] = updatedAssignment;
      }

      // Log successful assignment update
      this.analyticsService.logCustomEvent('assignment_updated', { assignmentId: updatedAssignment.id });
    }, error => {
      loading.dismiss();
      this.analyticsService.logCustomEvent('assignment_update_error', { assignmentId: this.currentAssignment!.id, error: error.message }); // Log error during update
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

  onSlotSelectionClose() {
    this.isSlotSelectionOpen = false;
    this.analyticsService.logCustomEvent('slot_selection_closed'); // Log closing of slot selection
  }
}
