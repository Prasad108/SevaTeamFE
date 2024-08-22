import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {

  constructor(
    private router: Router, 
    private authService: AuthService,
    private analyticsService: AnalyticsService
  ) {}

  ngOnInit() {
    this.analyticsService.logCustomEvent('admin_dashboard_viewed');
  }

  logout() {
    this.authService.logout().then(() => {
      this.analyticsService.logCustomEvent('admin_logout_success'); 
      this.router.navigate(['/login']); // Navigate to the login page after logout
    }).catch(error => {
      console.error('Logout error:', error);
      this.analyticsService.logCustomEvent('admin_logout_error', { error: error.message });
      // Optional: Show an alert or notification to the user
    });
  }
}
