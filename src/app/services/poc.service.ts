import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface POC {
  pocId?: string; // Optional because it will be auto-generated
  name: string;
  email: string;
  phoneNumber: string;
  initialPassword: string;
  centerId: string;
  authId?: string; // Firebase Authentication UID
  role: 'admin' | 'poc';
}

@Injectable({
  providedIn: 'root'
})
export class PocService {
  private pocsCollection: CollectionReference<POC>;

  constructor(private firestore: Firestore, private afAuth: AngularFireAuth) {
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

  // Add a new POC with Firebase Authentication
  addPoc(poc: POC): Observable<void> {
    return from(this.afAuth.createUserWithEmailAndPassword(poc.email, poc.initialPassword)).pipe(
      switchMap(userCredential => {
        const authId = userCredential.user?.uid;
        const pocWithAuthId = { ...poc, authId }; // Add authId to the POC object
        return from(addDoc(this.pocsCollection, pocWithAuthId)).pipe(
          switchMap(docRef => from(updateDoc(docRef, { pocId: docRef.id })))
        );
      }),
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

    return from(updateDoc(pocDocRef, { 
      name: poc.name, 
      email: poc.email, 
      phoneNumber: poc.phoneNumber, 
      initialPassword: poc.initialPassword, 
      centerId: poc.centerId,
      authId: poc.authId, // Ensure authId is not lost during updates
      role: poc.role 
    })).pipe(
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
