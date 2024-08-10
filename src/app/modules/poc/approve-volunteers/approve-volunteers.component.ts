import { Component, OnInit } from '@angular/core';
import { Volunteer, VolunteerService } from 'src/app/services/volunteer.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app//services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-approve-volunteers',
  templateUrl: './approve-volunteers.component.html',
  styleUrls: ['./approve-volunteers.component.scss']
})
export class ApproveVolunteersComponent implements OnInit {
  pendingVolunteers: Volunteer[] = [];
  centerId: string | null = null;

  constructor(
    private volunteerService: VolunteerService,
    private alertController: AlertController,
    private authService: AuthService,
    private storageService : StorageService

  ) {}

  ngOnInit() {
    const pocDetails = this.storageService.getStoredPocDetails();
    if (pocDetails) {
      this.centerId = pocDetails.centerId; 
      this.fetchPendingVolunteers();
    }else{
      console.log('current logged in user details not found')
    }
  }

  ionViewWillEnter() {
    // Fetch fresh data every time the view is about to enter
    this.fetchPendingVolunteers();
  }

  fetchPendingVolunteers() {
    if (this.centerId) {
      this.volunteerService.getPendingVolunteersByCenter(this.centerId).subscribe(volunteers => {
        this.pendingVolunteers = volunteers;
      });
    }
  }

  approveVolunteer(volunteerId: string) {
    this.volunteerService.approveVolunteer(volunteerId).then(() => {
      this.fetchPendingVolunteers();
    });
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
            this.volunteerService.deleteVolunteer(volunteerId).then(() => {
              this.fetchPendingVolunteers();
            });
          },
        },
      ],
    });

    await alert.present();
  }
}
