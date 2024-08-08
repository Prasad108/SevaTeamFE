import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth, private firestore: AngularFirestore) {
    this.currentUser$ = this.afAuth.authState as Observable<User | null>;
  }

  // Log in a user with email and password
  login(email: string, password: string): Promise<User | null> {
    return this.afAuth.signInWithEmailAndPassword(email, password)
      .then(userCredential => userCredential.user as User | null)
      .catch(error => {
        console.error('Login error:', error);
        throw error; 
      });
  }
  // Get user role from Firestore
  getUserRole(uid: string): Observable<string | null> {
    return this.firestore.doc(`users/${uid}`).get().pipe(
      map(doc => doc.exists ? (doc.data() as any).role : null)
    );
  }

  // Get current user role using custom claims (if needed)
  async getCurrentUserRole(): Promise<string | null> {
    const user = await this.afAuth.currentUser;
    if (user) {
      const tokenResult = await user.getIdTokenResult();
      return tokenResult.claims['role'] || null;
    }
    return null;
  }

  // Logout method
  logout(): Promise<void> {
    return this.afAuth.signOut().then(() => {
      console.log('User logged out successfully');
    }).catch(error => {
      console.error('Logout error:', error);
      throw error;
    });
  }

}
