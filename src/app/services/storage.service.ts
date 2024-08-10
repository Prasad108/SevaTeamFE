import { Injectable } from '@angular/core';
import { POC } from './poc.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  // Store POC details securely in localStorage
  storePocDetails(poc: POC) {
    const pocData = {
      pocId: poc.pocId,
      name: poc.name,
      email: poc.email,
      phoneNumber: poc.phoneNumber,
      centerId: poc.centerId,
      role: poc.role
    };
    localStorage.setItem('poc', JSON.stringify(pocData));
  }

  // Clear POC details from localStorage (can be used in logout)
  clearStoredPocDetails() {
    localStorage.removeItem('poc');
  }

  getStoredPocDetails(): POC | null {
    const storedPoc = localStorage.getItem('poc');
    return storedPoc ? JSON.parse(storedPoc) : null;
  }
}
