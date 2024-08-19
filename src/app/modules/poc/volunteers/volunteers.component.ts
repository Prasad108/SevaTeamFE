import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { AlertController } from '@ionic/angular';
import { User } from 'firebase/auth';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';

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
    private storageService : StorageService,
    private confirmationDialogService: ConfirmationDialogService 

  ) {}

  ngOnInit() {
    const pocDetails = this.storageService.getStoredPocDetails();
      if (pocDetails) {
        this.centerId = pocDetails.centerId; 
        this.pocId = pocDetails.pocId ? pocDetails.pocId: null; 
        this.fetchVolunteers();
      }else{
        console.log('current logged in user details not found')
      }
  }

  ionViewWillEnter() {
    // Fetch fresh data every time the view is about to enter
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
      });
    }
  }

  addVolunteer() {
    if (!this.validateVolunteer(this.newVolunteer)) return;

    this.volunteerService.addVolunteer(this.newVolunteer).subscribe(() => {
      this.fetchVolunteers();
      this.closeVolunteerModal();
    });
  }

  editVolunteer(volunteer: Volunteer) {
    this.editMode = true;
    this.selectedVolunteerId = volunteer.volunteerId!;
    this.newVolunteer = { ...volunteer };
    this.showVolunteerModal = true;
  }

  updateVolunteer() {
    if (!this.validateVolunteer(this.newVolunteer)) return;

    if (this.selectedVolunteerId) {
      const updatedVolunteer = { ...this.newVolunteer, volunteerId: this.selectedVolunteerId };
      this.volunteerService.updateVolunteer(updatedVolunteer).subscribe(() => {
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
          this.fetchVolunteers(); // Refresh the list of volunteers
        })
        .catch(error => {
          console.error('Error deleting volunteer:', error);
          this.showAlert('Error', 'Failed to delete the volunteer. Please try again.');
        });
    }
  }

  

  cancelEdit() {
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
    this.newVolunteer = this.resetVolunteer(); // Reset volunteer form data
    this.showVolunteerModal = true;
  }

  closeVolunteerModal() {
    this.showVolunteerModal = false;
  }
}
