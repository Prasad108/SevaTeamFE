import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(): boolean {
    const user = this.storageService.getStoredPocDetails();
    if (user) {
      return true;
    } else {
      this.router.navigate(['/home']); // Redirect to login if not authenticated
      return false;
    }
  }
}
