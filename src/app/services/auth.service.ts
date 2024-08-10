import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';
import { map, } from 'rxjs/operators';
import { POC, PocService } from './poc.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<User | null>;

  constructor(private afAuth: AngularFireAuth,
     private firestore: AngularFirestore,
     private storageService : StorageService,
    private pocService: PocService) {
    this.currentUser$ = this.afAuth.authState as Observable<User | null>;
    this.loadStoredUser(); // Load user details from storage on service initialization
  }

  // Log in a user with email and password, validate role, and store details
  async login(email: string, password: string): Promise<POC | null> {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      if (user) {
        const poc = await this.pocService.validateUserRoleAndStore(user.uid).toPromise();
        if(!poc){
          this.logout(); // Logout if the role is invalid
        }
        return poc || null; // Ensure that undefined is converted to null
      } else {
        return null;
      }
    } catch (error) {
      // console.error('Login error:', error);
      throw error;
    }
  }
  private loadStoredUser() {
    const storedUser = localStorage.getItem('poc');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Here you can trigger a custom auth state change or set the currentUser$ observable
      // based on the stored user information if needed.
    }
  }
  // Get user role from the POCs collection in Firestore
  getUserRole(uid: string): Observable<string | null> {
    return this.firestore.collection('pocs', ref => ref.where('authId', '==', uid)).get().pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const pocData = snapshot.docs[0].data() as POC;
          return pocData['role'];
        }
        return null;
      })
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
    this.storageService.clearStoredPocDetails(); // Clear stored POC details on logout
    return this.afAuth.signOut().then(() => {
      // console.log('User logged out successfully');
    }).catch(error => {
      console.error('Logout error:', error);
      throw error;
    });
  }

  

}
