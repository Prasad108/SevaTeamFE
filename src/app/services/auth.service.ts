import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from 'firebase/auth';
import { map, Observable } from 'rxjs';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<User | null|any>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.currentUser$ = this.afAuth.authState;
  }

  // Get user role from Firestore or custom claims
  getUserRole(uid: string): Observable<string | null> {
    return this.firestore.doc(`users/${uid}`).get().pipe(
      map(doc => doc.exists ? (doc.data() as any).role : null)
    );
  }

  async getCurrentUserRole(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims['role'] || null;
    }
    return null;
  }
}
