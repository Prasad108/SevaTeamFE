import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { AlertController } from '@ionic/angular';
import { StorageService } from 'src/app/services/storage.service';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { AnalyticsService } from 'src/app/services/analytics.service'; // Import your AnalyticsService

@Component({
  selector: 'app-volunteers',
  templateUrl: './volunteers.component.html',
  styleUrls: ['./volunteers.component.scss']
})
export class VolunteersComponent implements OnInit {
  volunteers: Volunteer[] = [];
  newVolunteer: Volunteer = this.resetVolunteer();
  editMode = false;
  selectedVolunteerId: string | null = null;
  centerId: string | null = null;
  pocId: string | null = null; // Assume POC ID is needed
  showVolunteerModal = false;

  constructor(
    private volunteerService: VolunteerService,
    private alertController: AlertController,
    private storageService: StorageService,
    private confirmationDialogService: ConfirmationDialogService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('volunteers_component_viewed');

    const pocDetails = this.storageService.getStoredPocDetails();
    if (pocDetails) {
      this.centerId = pocDetails.centerId; 
      this.pocId = pocDetails.pocId ? pocDetails.pocId : null; 
      this.fetchVolunteers();
    } else {
      console.log('current logged in user details not found');
    }
  }

  ionViewWillEnter() {
    this.fetchVolunteers();
  }

  resetVolunteer(): Volunteer {
    return {
      volunteerId: '',
      name: '',
      phoneNumber: '',
      gender: '',
      age: 0,
      status: 'approved', // Default status for new volunteers
      centerId: this.centerId!,
      pocId: this.pocId!,
    };
  }

  fetchVolunteers() {
    if (this.centerId) {
      this.volunteerService.getVolunteersByCenter(this.centerId).subscribe(volunteers => {
        this.volunteers = volunteers;
        this.analyticsService.logCustomEvent('volunteers_fetched', { centerId: this.centerId }); // Log fetching volunteers
      });
    }
  }

  addVolunteer() {
    if (!this.validateVolunteer(this.newVolunteer)) return;

    this.volunteerService.addVolunteer(this.newVolunteer).subscribe(() => {
      this.analyticsService.logCustomEvent('volunteer_added', { name: this.newVolunteer.name }); // Log volunteer added
      this.fetchVolunteers();
      this.closeVolunteerModal();
    });
  }

  editVolunteer(volunteer: Volunteer) {
    this.editMode = true;
    this.selectedVolunteerId = volunteer.volunteerId!;
    this.newVolunteer = { ...volunteer };
    this.showVolunteerModal = true;
    this.analyticsService.logCustomEvent('volunteer_edit_initiated', { volunteerId: volunteer.volunteerId }); // Log edit initiated
  }

  updateVolunteer() {
    if (!this.validateVolunteer(this.newVolunteer)) return;

    if (this.selectedVolunteerId) {
      const updatedVolunteer = { ...this.newVolunteer, volunteerId: this.selectedVolunteerId };
      this.volunteerService.updateVolunteer(updatedVolunteer).subscribe(() => {
        this.analyticsService.logCustomEvent('volunteer_updated', { volunteerId: this.selectedVolunteerId }); // Log volunteer updated
        this.fetchVolunteers();
        this.cancelEdit();
      });
    }
  }

  async deleteVolunteer(volunteerId: string) {
    const confirmed = await this.confirmationDialogService.confirmDelete(
      'Are you sure you want to delete this volunteer?', // Custom message
      'Type "delete" to confirm' // Custom placeholder
    );

    if (confirmed) {
      this.volunteerService.deleteVolunteer(volunteerId)
        .then(() => {
          this.analyticsService.logCustomEvent('volunteer_deleted', { volunteerId });
          this.fetchVolunteers(); // Refresh the list of volunteers
        })
        .catch(error => {
          console.error('Error deleting volunteer:', error);
          this.showAlert('Error', 'Failed to delete the volunteer. Please try again.');
        });
    }
  }

  cancelEdit() {
    this.analyticsService.logCustomEvent('edit_cancelled');
    this.editMode = false;
    this.selectedVolunteerId = null;
    this.newVolunteer = this.resetVolunteer();
    this.closeVolunteerModal();
  }

  validateVolunteer(volunteer: Volunteer): boolean {
    if (!volunteer.name || !volunteer.phoneNumber || !volunteer.gender || volunteer.age <= 0) {
      this.showAlert('Validation Error', 'All fields are required and age must be greater than 0.');
      return false;
    }
    return true;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  openAddVolunteerModal() {
    this.analyticsService.logCustomEvent('add_volunteer_modal_opened'); // Log opening of add volunteer modal
    this.newVolunteer = this.resetVolunteer(); // Reset volunteer form data
    this.showVolunteerModal = true;
  }

  closeVolunteerModal() {
    this.analyticsService.logCustomEvent('volunteer_modal_closed'); // Log closing of volunteer modal
    this.showVolunteerModal = false;
  }
}
