import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { AuthService } from '../../../services/auth.service';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, AngularFireAuthModule]
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private authService: AuthService, private alertController: AlertController) {}

  async login() {
    try {
      // Log in using AuthService
      const poc = await this.authService.login(this.email, this.password);
      if (poc) {
        if (poc.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (poc.role === 'poc') {
          this.router.navigate(['/poc']);
        } else {
          this.authService.logout();
          this.showAlert('Access Denied', 'You do not have access to this application.');
        }
      } else {
        this.authService.logout();
        this.showAlert('Login Failed', 'Unable to log in user.');
      }
    } catch (error: any) {
      // console.error('Login error:', error);
      if (error.message.includes('auth/invalid-credential')) {
        this.showAlert('Login Failed', 'Invalid credentials');
      } else {
        this.showAlert('Login Failed', error.message);
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });

    await alert.present();
  }
}
