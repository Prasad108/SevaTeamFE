import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, LoadingController } from '@ionic/angular';

import { PocService, POC } from '../../../services/poc.service';
import { Center, CenterService } from 'src/app/services/center.service';

@Component({
  selector: 'app-pocs',
  templateUrl: './pocs.component.html',
  styleUrls: ['./pocs.component.scss'],
})
export class PocsComponent implements OnInit {
  @ViewChild('pocModal', { static: true }) pocModal!: IonModal;

  pocs: POC[] = [];
  centers: Center[] = [];
  showPassword = false; // Track password visibility

  newPoc: POC = { name: '', email: '', phoneNumber: '', initialPassword: '', centerId: '', role: 'poc' };
  editMode = false;
  selectedPocId: string | null = null;
  isModalOpen = false;

  constructor(
    private pocService: PocService,
    private centerService: CenterService,
    private alertController: AlertController,
    private loadingController: LoadingController // Add LoadingController
  ) {}

  ngOnInit() {
    this.fetchPocs();
    this.fetchCenters();
  }

  async presentLoading(message: string) {
    const loading = await this.loadingController.create({
      message,
    });
    await loading.present();
    return loading;
  }

  async fetchCenters() {
    const loading = await this.presentLoading('Loading centers...');
    this.centerService.getCenters().subscribe(
      (centers) => {
        this.centers = centers;
        loading.dismiss(); // Dismiss loading indicator
      },
      (error) => {
        console.error('Error fetching centers:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.showAlert('Error', 'Failed to load centers.');
      }
    );
  }

  async fetchPocs() {
    const loading = await this.presentLoading('Loading POCs...');
    this.pocService.getPocs().subscribe(
      (pocs: POC[]) => {
        this.pocs = pocs;
        loading.dismiss(); // Dismiss loading indicator
      },
      (error) => {
        console.error('Error fetching POCs:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.showAlert('Error', 'Failed to load POCs.');
      }
    );
  }

  async addPoc() {
    if (!this.newPoc.name || !this.newPoc.email || !this.newPoc.phoneNumber || !this.newPoc.initialPassword || !this.newPoc.centerId) {
      await this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    const loading = await this.presentLoading('Adding POC...');
    this.pocService.addPoc(this.newPoc).subscribe(() => {
      this.fetchPocs();
      this.closePocModal();
      loading.dismiss(); // Dismiss loading indicator
    }, error => {
      console.error('Error creating POC:', error);
      loading.dismiss(); // Dismiss loading indicator
      this.showAlert('Error', 'Failed to create POC. Please try again or use different values.');
    });
  }

  editPoc(poc: POC) {
    this.editMode = true;
    this.selectedPocId = poc.pocId!;
    this.newPoc = { ...poc };
    this.openPocModal();
  }

  async updatePoc() {
    if (!this.newPoc.name || !this.newPoc.email || !this.newPoc.phoneNumber || !this.newPoc.initialPassword || !this.newPoc.centerId) {
      this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    if (this.selectedPocId) {
      const loading = await this.presentLoading('Updating POC...');
      const updatedPoc = { ...this.newPoc, pocId: this.selectedPocId };
      this.pocService.updatePoc(updatedPoc).subscribe(() => {
        this.fetchPocs();
        this.closePocModal();
        loading.dismiss(); // Dismiss loading indicator
      }, error => {
        console.error('Error updating POC:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.showAlert('Error', 'Failed to update POC. Please try again.');
      });
    } else {
      this.showAlert('Error', 'No POC selected for update.');
    }
  }

  async deletePoc(pocId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this POC?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            const loading = await this.presentLoading('Deleting POC...');
            this.pocService.deletePoc(pocId).subscribe(() => {
              this.fetchPocs();
              loading.dismiss(); // Dismiss loading indicator
            }, error => {
              console.error('Error deleting POC:', error);
              loading.dismiss(); // Dismiss loading indicator
              this.showAlert('Error', 'Failed to delete POC.');
            });
          },
        },
      ],
    });

    await alert.present();
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedPocId = null;
    this.resetNewPoc();
    this.closePocModal();
  }

  openPocModal() {
    this.isModalOpen = true;
  }

  closePocModal() {
    this.isModalOpen = false;
    this.resetNewPoc();
  }

  onModalDidDismiss() {
    this.resetNewPoc();
    this.editMode = false;
  }

  resetNewPoc() {
    this.newPoc = { name: '', email: '', phoneNumber: '', initialPassword: '', centerId: '', role: 'poc' };
    this.showPassword = false; // Reset password visibility when closing modal
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }

  getCenterName(centerId: string): string {
    const center = this.centers.find(c => c.centerId === centerId);
    return center ? `${center.name} - ${center.location}` : 'Unknown Center';
  }
}
