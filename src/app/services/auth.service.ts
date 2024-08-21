import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, authState, User } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { POC, PocService } from './poc.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private storageService: StorageService,
    private pocService: PocService
  ) {
    this.currentUser$ = authState(this.auth);
    this.loadStoredUser(); // Load user details from storage on service initialization
  }

  // Log in a user with email and password, validate role, and store details
  async login(email: string, password: string): Promise<POC | null> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;
      if (user) {
        const poc = await this.pocService.validateUserRoleAndStore(user.uid).toPromise();
        if (!poc) {
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
    const pocCollection = collection(this.firestore, 'pocs');
    const roleQuery = query(pocCollection, where('authId', '==', uid));

    return from(getDocs(roleQuery)).pipe(
      map(snapshot => {
        if (!snapshot.empty) {
          const pocData = snapshot.docs[0].data() as POC;
          return pocData['role'];
        }
        return null;
      })
    );
  }


  // Logout method
  async logout(): Promise<void> {
    this.storageService.clearStoredPocDetails(); // Clear stored POC details on logout
    try {
      await this.auth.signOut();
      // console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }
}
