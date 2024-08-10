import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular';

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

  newPoc: POC = { name: '', email: '', phoneNumber: '', initialPassword: '', centerId: '', role:'poc' };
  editMode = false;
  selectedPocId: string | null = null;
  isModalOpen = false;

  constructor(
    private pocService: PocService,
    private centerService: CenterService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.fetchPocs();
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

  fetchPocs() {
    this.pocService.getPocs().subscribe(
      (pocs: POC[]) => {
        this.pocs = pocs;
      },
      (error) => {
        console.error('Error fetching POCs:', error);
        this.showAlert('Error', 'Failed to load POCs.');
      }
    );
  }

  async addPoc() {
    if (!this.newPoc.name || !this.newPoc.email || !this.newPoc.phoneNumber || !this.newPoc.initialPassword || !this.newPoc.centerId) {
      await this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    this.pocService.addPoc(this.newPoc).subscribe(() => {
      this.fetchPocs();
      this.closePocModal();
    }, error => {
      console.error('Error creating POC:', error);
      this.showAlert('Error', 'Failed to create POC. Please try again.');
    });
  }

  editPoc(poc: POC) {
    this.editMode = true;
    this.selectedPocId = poc.pocId!;
    this.newPoc = { ...poc };
    this.openPocModal();
  }

  updatePoc() {
    if (!this.newPoc.name || !this.newPoc.email || !this.newPoc.phoneNumber || !this.newPoc.initialPassword || !this.newPoc.centerId) {
      this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    if (this.selectedPocId) {
      const updatedPoc = { ...this.newPoc, pocId: this.selectedPocId };
      this.pocService.updatePoc(updatedPoc).subscribe(() => {
        this.fetchPocs();
        this.closePocModal();
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
            try {
              await this.pocService.deletePoc(pocId).toPromise();
              this.fetchPocs();
            } catch (error) {
              console.error('Error deleting POC:', error);
              this.showAlert('Error', 'Failed to delete POC.');
            }
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
    this.newPoc = { name: '', email: '', phoneNumber: '', initialPassword: '', centerId: '', role:'poc' };
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
