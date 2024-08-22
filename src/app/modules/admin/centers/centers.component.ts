import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal } from '@ionic/angular';
import { CenterService } from '../../../services/center.service';
import { Center } from '../../../services/center.service';
import { ConfirmationDialogService } from '../../../services/confirmation-dialog.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-centers',
  templateUrl: './centers.component.html',
  styleUrls: ['./centers.component.scss'],
})
export class CentersComponent implements OnInit {
  @ViewChild('centerModal', { static: true }) centerModal!: IonModal;

  centers: Center[] = [];
  newCenter: Center = { name: '', location: '' };
  editMode = false;
  selectedCenterId: string | null = null;
  isModalOpen = false;

  constructor(
    private centerService: CenterService,
    private alertController: AlertController,
    private confirmationDialogService: ConfirmationDialogService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.fetchCenters();
  }

  fetchCenters() {
    this.centerService.getCenters().subscribe(
      (centers) => {
        this.centers = centers;
        this.analyticsService.logCustomEvent('admin_fetch_centers_success');
      },
      (error) => {
        console.error('Error fetching centers:', error);
        this.analyticsService.logCustomEvent('admin_fetch_centers_error', { error: error.message });
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
      this.closeCenterModal();
      this.analyticsService.logCustomEvent('admin_center_added', { centerName: this.newCenter.name });
    });
  }

  editCenter(center: Center) {
    this.editMode = true;
    this.selectedCenterId = center.centerId!;
    this.newCenter = { ...center };
    this.openCenterModal();
    this.analyticsService.logCustomEvent('admin_edit_center', { centerId: this.selectedCenterId });
  }

  updateCenter() {
    if (!this.newCenter.name || !this.newCenter.location) {
      this.showAlert('Validation Error', 'All fields are required.');
      return;
    }

    if (this.selectedCenterId) {
      const updatedCenter = { ...this.newCenter, centerId: this.selectedCenterId };
      this.centerService.updateCenter(updatedCenter).subscribe(() => {
        this.fetchCenters();
        this.closeCenterModal();
        this.analyticsService.logCustomEvent('admin_center_updated', { centerId: this.selectedCenterId });
      });
    } else {
      this.showAlert('Error', 'No center selected for update.');
    }
  }

  async deleteCenter(centerId: string) {
    const confirmed = await this.confirmationDialogService.confirmDelete();
    if (confirmed) {
      try {
        await this.centerService.deleteCenter(centerId);
        this.centers = this.centers.filter((center) => center.centerId !== centerId);
        this.analyticsService.logCustomEvent('admin_center_deleted', { centerId });
      } catch (error) {
        console.error('Error deleting center:', error);
        this.analyticsService.logCustomEvent('admin_center_delete_error', { error: error, centerId }); 
        this.showAlert('Error', 'Failed to delete center.');
      }
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedCenterId = null;
    this.resetNewCenter();
    this.closeCenterModal();
    this.analyticsService.logCustomEvent('admin_edit_cancelled');
  }

  openCenterModal() {
    this.isModalOpen = true;
  }

  closeCenterModal() {
    this.isModalOpen = false;
    this.resetNewCenter();
  }

  onModalDidDismiss() {
    this.resetNewCenter();
    this.editMode = false;
  }

  resetNewCenter() {
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
