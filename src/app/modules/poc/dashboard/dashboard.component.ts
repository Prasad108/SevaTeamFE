import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AnalyticsService } from 'src/app/services/analytics.service';  // Import your AnalyticsService

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

  ngOnInit(): void {
    this.logDashboardView();
  }

  private logDashboardView(): void {
    this.analyticsService.logCustomEvent('dashboard_view', {
      component: 'DashboardComponent',
      timestamp: new Date().toISOString(),
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout().then(() => {
      this.router.navigate(['/home']); // Redirect to login page after logout
    }).catch(error => {
      console.error('Logout error:', error);
      // Optionally show a notification or alert here
    });
  }
}
