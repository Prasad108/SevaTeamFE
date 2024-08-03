import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, CollectionReference } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Center {
  centerId?: string; // Optional because it will be auto-generated
  name: string;
  location: string;
}

@Injectable({
  providedIn: 'root'
})
export class CenterService {
  private centersCollection: CollectionReference<Center>;

  constructor(private firestore: Firestore) {
    this.centersCollection = collection(this.firestore, 'centers') as CollectionReference<Center>;
  }

  // Fetch all centers
  getCenters(): Observable<Center[]> {
    return from(getDocs(this.centersCollection)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          centerId: doc.id,
          ...doc.data()
        }));
      })
    );
  }

  // Add a new center
  addCenter(center: Center): Observable<void> {
    return from(addDoc(this.centersCollection, center)).pipe(
      map(() => {
        console.log('Center added successfully');
      })
    );
  }

  // Update an existing center
  updateCenter(center: Center): Observable<void> {
    if (!center.centerId) {
      throw new Error('Center ID is required for updating');
    }

    const centerDocRef = doc(this.centersCollection, center.centerId);

    // Ensure we pass an object with exact fields to be updated
    return from(updateDoc(centerDocRef, { name: center.name, location: center.location })).pipe(
      map(() => {
        console.log('Center updated successfully');
      })
    );
  }

  // Delete a center
  deleteCenter(centerId: string): Observable<void> {
    const centerDocRef = doc(this.centersCollection, centerId);
    return from(deleteDoc(centerDocRef)).pipe(
      map(() => {
        console.log('Center deleted successfully');
      })
    );
  }
}