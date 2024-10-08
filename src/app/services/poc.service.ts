import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, CollectionReference, where, query, documentId, getDoc } from '@angular/fire/firestore';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { StorageService } from './storage.service';

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

  constructor(
    private firestore: Firestore,
    private auth: Auth,  // Use the modular Auth service
    private storageService: StorageService
  ) {
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
    return from(createUserWithEmailAndPassword(this.auth, poc.email, poc.initialPassword)).pipe(
      switchMap(userCredential => {
        const authId = userCredential.user?.uid;
        const pocWithAuthId = { ...poc, authId }; // Add authId to the POC object
        return from(addDoc(this.pocsCollection, pocWithAuthId)).pipe(
          switchMap(docRef => from(updateDoc(docRef, { pocId: docRef.id })))
        );
      }),
      map(() => {
        // console.log('POC added successfully');
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
        // console.log('POC updated successfully');
      })
    );
  }

  // Delete a POC
  deletePoc(pocId: string): Observable<void> {
    const pocDocRef = doc(this.pocsCollection, pocId);
    return from(deleteDoc(pocDocRef)).pipe(
      map(() => {
        // console.log('POC deleted successfully');
      })
    );
  }

   // Validate user role from POCs collection, store user details if valid, and handle invalid cases
   validateUserRoleAndStore(uid: string): Observable<POC | null> {
    const pocQuery = query(this.pocsCollection, where('authId', '==', uid));
    
    return from(getDocs(pocQuery)).pipe(
      switchMap(snapshot => {
        if (!snapshot.empty) {
          const pocData = snapshot.docs[0].data() as POC;
          const validRoles = ['admin', 'poc'];
          if (validRoles.includes(pocData.role)) {
            this.storageService.storePocDetails(pocData); // Store POC details
            return from([pocData]); // Return valid POC details
          } else {
            return from([null]);
          }
        } else {
          return from([null]);
        }
      })
    );
  }

  // Get POC by authId
  getPocByAuthId(authId: string): Observable<POC | null> {
    const pocQuery = query(this.pocsCollection, where('authId', '==', authId));
    
    return from(getDocs(pocQuery)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          return snapshot.docs[0].data() as POC;
        }
        return null;
      })
    );
  }

  // Get POCs by their IDs
  getPocsByIds(pocIds: string[]): Observable<POC[]> {
    const q = query(this.pocsCollection, where(documentId(), 'in', pocIds));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ pocId: doc.id, ...doc.data() } as POC)))
    );
  }

  // Fetch a POC by its ID
  getPocById(pocId: string): Observable<POC | undefined> {
    const pocDocRef = doc(this.pocsCollection, pocId);
    return from(getDoc(pocDocRef)).pipe(
      map(snapshot => snapshot.exists() ? { pocId: snapshot.id, ...snapshot.data() } as POC : undefined)
    );
  }
}
