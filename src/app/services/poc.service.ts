// src/app/services/poc.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface POC {
  pocId?: string; // Optional because it will be auto-generated
  name: string;
  email: string;
  phoneNumber: string;
  initialPassword: string;
  centerId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PocService {
  private pocsCollection: CollectionReference<POC>;

  constructor(private firestore: Firestore) {
    this.pocsCollection = collection(this.firestore, 'pocs') as CollectionReference<POC>;
  }

  // Fetch all POCs
  getPocs(): Observable<POC[]> {
    return from(getDocs(this.pocsCollection)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          pocId: doc.id,
          ...doc.data()
        }));
      })
    );
  }

  // Add a new POC
  addPoc(poc: POC): Observable<void> {
    return from(addDoc(this.pocsCollection, poc)).pipe(
      map(() => {
        console.log('POC added successfully');
      })
    );
  }

  // Update an existing POC
  updatePoc(poc: POC): Observable<void> {
    if (!poc.pocId) {
      throw new Error('POC ID is required for updating');
    }

    const pocDocRef = doc(this.pocsCollection, poc.pocId);

    return from(updateDoc(pocDocRef, { name: poc.name, email: poc.email, phoneNumber: poc.phoneNumber, initialPassword: poc.initialPassword, centerId: poc.centerId })).pipe(
      map(() => {
        console.log('POC updated successfully');
      })
    );
  }

  // Delete a POC
  deletePoc(pocId: string): Observable<void> {
    const pocDocRef = doc(this.pocsCollection, pocId);
    return from(deleteDoc(pocDocRef)).pipe(
      map(() => {
        console.log('POC deleted successfully');
      })
    );
  }
}