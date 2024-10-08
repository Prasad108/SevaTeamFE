import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonModal, LoadingController } from '@ionic/angular';
import { PocService, POC } from '../../../services/poc.service';
import { Center, CenterService } from 'src/app/services/center.service';
import { ConfirmationDialogService } from 'src/app/services/confirmation-dialog.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-pocs',
  templateUrl: './pocs.component.html',
  styleUrls: ['./pocs.component.scss'],
})
export class PocsComponent implements OnInit {
  @ViewChild('pocModal', { static: true }) pocModal!: IonModal;

  pocs: POC[] = [];
  centers: Center[] = [];
  showPassword = false;

  newPoc: POC = { name: '', email: '', phoneNumber: '', initialPassword: '', centerId: '', role: 'poc' };
  editMode = false;
  selectedPocId: string | null = null;
  isModalOpen = false;

  constructor(
    private pocService: PocService,
    private centerService: CenterService,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private confirmationDialogService: ConfirmationDialogService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('admin_pocs_component_viewed');
    this.fetchCenters();
    this.fetchPocs();
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
        this.analyticsService.logCustomEvent('admin_centers_fetched', { centerCount: centers.length });
      },
      (error) => {
        console.error('Error fetching centers:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.analyticsService.logCustomEvent('admin_centers_fetch_error', { error: error.message });
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
        this.analyticsService.logCustomEvent('admin_pocs_fetched', { pocCount: pocs.length });
      },
      (error) => {
        console.error('Error fetching POCs:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.analyticsService.logCustomEvent('admin_pocs_fetch_error', { error: error.message });
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
      this.analyticsService.logCustomEvent('admin_poc_added', { pocName: this.newPoc.name });
    }, error => {
      console.error('Error creating POC:', error);
      loading.dismiss(); // Dismiss loading indicator
      this.analyticsService.logCustomEvent('admin_poc_add_error', { error: error.message });
      this.showAlert('Error', 'Failed to create POC. Please try again or use different values.');
    });
  }

  editPoc(poc: POC) {
    this.editMode = true;
    this.selectedPocId = poc.pocId!;
    this.newPoc = { ...poc };
    this.openPocModal();
    this.analyticsService.logCustomEvent('admin_poc_edit_initiated', { pocId: poc.pocId });
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
        this.analyticsService.logCustomEvent('admin_poc_updated', { pocId: this.selectedPocId });
      }, error => {
        console.error('Error updating POC:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.analyticsService.logCustomEvent('admin_poc_update_error', { pocId: this.selectedPocId, error: error.message }); // Log error during POC update
        this.showAlert('Error', 'Failed to update POC. Please try again.');
      });
    } else {
      this.showAlert('Error', 'No POC selected for update.');
    }
  }

  async deletePoc(pocId: string) {
    const confirmed = await this.confirmationDialogService.confirmDelete();

    if (confirmed) {
      const loading = await this.presentLoading('Deleting POC...');
      this.pocService.deletePoc(pocId).subscribe(() => {
        this.fetchPocs();
        loading.dismiss(); // Dismiss loading indicator
        this.analyticsService.logCustomEvent('admin_poc_deleted', { pocId }); // Log POC deleted
      }, error => {
        console.error('Error deleting POC:', error);
        loading.dismiss(); // Dismiss loading indicator
        this.analyticsService.logCustomEvent('admin_poc_delete_error', { pocId, error: error.message }); // Log error during POC deletion
        this.showAlert('Error', 'Failed to delete POC.');
      });
    }
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedPocId = null;
    this.resetNewPoc();
    this.closePocModal();
    this.analyticsService.logCustomEvent('admin_poc_edit_cancelled');
  }

  openPocModal() {
    this.isModalOpen = true;
    this.analyticsService.logCustomEvent('admin_poc_modal_opened');
  }

  closePocModal() {
    this.isModalOpen = false;
    this.resetNewPoc();
    this.analyticsService.logCustomEvent('admin_poc_modal_closed');
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
