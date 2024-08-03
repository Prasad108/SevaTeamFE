import { Component, OnInit } from '@angular/core';
import { AlertController, IonicModule, ModalController } from '@ionic/angular';
import { CenterService } from '../../../services/center.service';
import { Center } from '../../../services/center.service';
@Component({
  selector: 'app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss'],
})
export class CentersComponent implements OnInit {
  centers: Center[] = [];
  newCenter: Center = { name: '', location: '' };
  editMode = false;
  selectedCenterId: string | null = null;

  constructor(
    private centerService: CenterService,
    private alertController: AlertController
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
  async addCenter() {
    if (!this.newCenter.name || !this.newCenter.location) {
      await this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    this.centerService.addCenter(this.newCenter).subscribe(() => {
      this.fetchCenters();
      this.newCenter = { name: '', location: '' };
    });
  }

  editCenter(center: Center) {
    this.editMode = true;
    this.selectedCenterId = center.centerId!;
    this.newCenter = { ...center };
  }

  updateCenter() {
    if (!this.newCenter.name || !this.newCenter.location) {
      this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    // Ensure centerId is never null
    if (this.selectedCenterId) {
      const updatedCenter = { ...this.newCenter, centerId: this.selectedCenterId };
      this.centerService.updateCenter(updatedCenter).subscribe(() => {
        this.fetchCenters();
        this.cancelEdit();
      });
    } else {
      this.showAlert('Error', 'No center selected for update.');
    }
  }

  async deleteCenter(centerId: string) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this center?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.centerService.deleteCenter(centerId);
              this.centers = this.centers.filter((center) => center.centerId !== centerId);
            } catch (error) {
              console.error('Error deleting center:', error);
              this.showAlert('Error', 'Failed to delete center.');
            }
          },
        },
      ],
    });
  
    await alert.present();
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedCenterId = null;
    this.newCenter = { name: '', location: '' };
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}