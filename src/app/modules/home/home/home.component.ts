import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, LoadingController } from '@ionic/angular';
import { AnalyticsService } from 'src/app/services/analytics.service';
import { TestDataService } from 'src/app/services/test-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class HomeComponent {

  constructor(
    private router: Router,
    private testDataService: TestDataService,
    private loadingController: LoadingController,
    private analyticsService: AnalyticsService
  ) {
  }

  async generateTestData() {
    const loading = await this.loadingController.create({
      message: 'Generating test data...',
    });

    await loading.present();

    this.testDataService.generateTestData().then(() => {
      loading.dismiss();
    }).catch(() => {
      loading.dismiss();  // Make sure to dismiss the loader even if an error occurs
    });
  }

  async deleteTestData() {
    const loading = await this.loadingController.create({
      message: 'Deleting test data...',
    });

    await loading.present();

    this.testDataService.deleteTestData().then(() => {
      loading.dismiss();
    }).catch(() => {
      loading.dismiss();  // Make sure to dismiss the loader even if an error occurs
    });
  }

  navigateToLogin() {
    this.analyticsService.logCustomEvent('User went to login page');
    this.router.navigate(['/login']);
  }

  navigateToVolunteerRegistration() {
    this.analyticsService.logCustomEvent( 'User went to volunteer-registration page');
    this.router.navigate(['/volunteer-registration']);
  }
}
