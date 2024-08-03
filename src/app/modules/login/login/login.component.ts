// src/app/modules/login/login.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { getAuth, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Firestore, collection, doc, getDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonicModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private router: Router, private firestore: Firestore, private alertController: AlertController) {}

  async login() {
    const auth = getAuth();
    try {
      // Sign in using Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password);
      const user = userCredential.user;
      console.log('User logged in:', user);
      console.log('User logged in uid :', user.uid);


      // Fetch user role from Firestore
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userDoc = await getDoc(userDocRef);
      

      if (userDoc.exists()) {
        console.log('user info from db: ',userDoc.data())
        const userData = userDoc.data();
        const role = userData['role'];

        // Navigate based on user role
        if (role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (role === 'poc') {
          this.router.navigate(['/poc']);
        } else {
          this.showAlert('Access Denied', 'You do not have access to this application.');
        }
      } else {
        this.showAlert('User Not Found', 'No user data found in Firestore.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.showAlert('Login Failed', error.message);
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