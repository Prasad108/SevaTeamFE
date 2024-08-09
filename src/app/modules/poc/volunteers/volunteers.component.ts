import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { AlertController } from '@ionic/angular';
import { User } from 'firebase/auth';
import { AuthService } from 'src/app/services/auth.service';

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
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user: User | null) => {
      if (user) {
        // Assuming the centerId and pocId are stored in the user's claims or user profile
        this.centerId = user.uid; // Replace with actual logic to get centerId
        this.pocId = user.uid; // Replace with actual logic to get pocId
        this.fetchVolunteers();
      }
    });
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
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this volunteer?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            this.volunteerService.deleteVolunteer(volunteerId).subscribe(() => {
              this.fetchVolunteers();
            });
          },
        },
      ],
    });

    await alert.present();
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
