import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { VolunteerService } from '../../../services/volunteer.service';
import { Volunteer } from '../../../services/volunteer.service';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule, NgForm } from '@angular/forms';
import { Center, CenterService } from 'src/app/services/center.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AnalyticsService } from 'src/app/services/analytics.service';

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
  showCounselorDetails = false; // Flag to show/hide the counselor details field
  counselorDetails: string = ''; // To store the counselor details when 'Other' is selected
  
  @ViewChild('volunteerForm', { static: true }) volunteerForm!: NgForm; // Access the form

  constructor(
    private volunteerService: VolunteerService,
    @Inject(AlertController) private alertController: AlertController, // Inject AlertController directly
    private centerService: CenterService,
    private router: Router, // Inject Router for navigation
    private analyticsService: AnalyticsService // Inject AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('volunteer_registration_viewed');
    this.fetchCenters();
  }

  fetchCenters() {
    this.centerService.getCenters().subscribe(
      (centers) => {
        // Separate "Other" center, case insensitive
        const otherCenters = centers.filter(center => center.name.toLowerCase() === 'other');
        const normalCenters = centers.filter(center => center.name.toLowerCase() !== 'other');
  
        // Sort normal centers by name
        normalCenters.sort((a, b) => a.name.localeCompare(b.name));
  
        // Combine the sorted centers and put "Other" at the end
        this.centers = [...normalCenters, ...otherCenters];
  
        this.analyticsService.logCustomEvent('centers_fetched', { centerCount: centers.length });
      },
      (error) => {
        console.error('Error fetching centers:', error);
        this.analyticsService.logCustomEvent('centers_fetch_error', { error: error.message });
        this.showAlert('Error', 'Failed to load centers.');
      }
    );
  }
 
  onCenterChange(event: any) {
    const selectedCenterId = event.detail.value;
    const selectedCenter = this.centers.find(center => center.centerId === selectedCenterId);
    this.showCounselorDetails = selectedCenter?.name.toLowerCase() === 'other';
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
  
    // If the counselor details are filled, add them to the volunteer object
    if (this.showCounselorDetails) {
      this.newVolunteer.counselorDetails = this.counselorDetails;
    } else {
      delete this.newVolunteer.counselorDetails; // Ensure it doesn't get included if not needed
    }
  
    this.volunteerService.addVolunteer(this.newVolunteer).subscribe(() => {
      this.analyticsService.logCustomEvent('volunteer_registered', { volunteerName: this.newVolunteer.name });
      this.showAlert('Success', 'Your registration has been submitted. You will be notified once it is approved.', true);
      this.volunteerForm.resetForm(this.resetVolunteer()); // Reset the form and clear errors
      this.showCounselorDetails = false; // Reset the counselor details visibility
      this.counselorDetails = ''; // Reset the counselor details field
    }, (error: any) => {
      console.error('Error registering volunteer:', error);
      this.analyticsService.logCustomEvent('volunteer_registration_error', { error: error.message });
      this.showAlert('Error', 'Failed to register. Please try again.');
    });
  }
  

  validateVolunteer(volunteer: Volunteer): boolean {
    if (!volunteer.name || !volunteer.phoneNumber || !volunteer.gender || volunteer.age <= 0 || !volunteer.centerId) {
      this.analyticsService.logCustomEvent('volunteer_registration_validation_error');
      this.showAlert('Validation Error', 'All fields are required, and age must be greater than 0.');
      return false;
    }

    if (this.showCounselorDetails && !this.counselorDetails) {
      this.showAlert('Validation Error', 'Your counselor\'s details are required.');
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