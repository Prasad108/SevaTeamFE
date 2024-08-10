import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private storageService: StorageService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRole = route.data['expectedRole'];
    const pocDetails = this.storageService.getStoredPocDetails();

    if (pocDetails && pocDetails.role === expectedRole) {
      return true;
    } else {
      this.router.navigate(['/home']); // Redirect to login if the role is not correct
      return false;
    }
  }
}
