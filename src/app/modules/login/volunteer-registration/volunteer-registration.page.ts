import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { Center, CenterService } from 'src/app/services/center.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-volunteer-registration',
  templateUrl: './volunteer-registration.page.html',
  styleUrls: ['./volunteer-registration.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule, RouterModule]
})
export class VolunteerRegistrationPage implements OnInit {
  centers: Center[] = [];
  newVolunteer: Volunteer = this.resetVolunteer();
  
  @ViewChild('volunteerForm', { static: true }) volunteerForm!: NgForm; // Access the form

  constructor(
    private volunteerService: VolunteerService,
    @Inject(AlertController) private alertController: AlertController, // Inject AlertController directly
    private centerService: CenterService,
    private router: Router // Inject Router for navigation
  ) {}

  ngOnInit() {
    this.fetchCenters();
  }

  fetchCenters() {
    this.centerService.getCenters().subscribe(
      (centers) => {
        this.centers = centers;
      },
      (error) => {
        console.error('Error fetching centers:', error);
        this.showAlert('Error', 'Failed to load centers.');
      }
    );
  }

  resetVolunteer(): Volunteer {
    return {
      name: '',
      phoneNumber: '',
      gender: '',
      age: 0,
      status: 'pending', // Initial status
      centerId: '', // Selected by the user
    };
  }

  registerVolunteer() {
    if (!this.validateVolunteer(this.newVolunteer)) return;
  
    this.volunteerService.addVolunteer(this.newVolunteer).subscribe(() => {
      this.showAlert('Success', 'Your registration has been submitted. You will be notified once it is approved.', true);
      this.volunteerForm.resetForm(this.resetVolunteer()); // Reset the form and clear errors
    }, (error: any) => {
      console.error('Error registering volunteer:', error);
      this.showAlert('Error', 'Failed to register. Please try again.');
    });
  }

  validateVolunteer(volunteer: Volunteer): boolean {
    if (!volunteer.name || !volunteer.phoneNumber || !volunteer.gender || volunteer.age <= 0 || !volunteer.centerId) {
      this.showAlert('Validation Error', 'All fields are required, and age must be greater than 0.');
      return false;
    }
    return true;
  }

  async showAlert(header: string, message: string, navigateToLogin: boolean = false) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (navigateToLogin) {
              this.router.navigate(['/home']); // Navigate to the login page
            }
          }
        }
      ],
    });

    await alert.present();
  }
}
