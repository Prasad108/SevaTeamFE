import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAnalytics, getAnalytics } from '@angular/fire/analytics';

export const firebaseConfig = {
    apiKey: "AIzaSyDHTsrBDBZOiNVDKBJ4MVCjNtxvZP5Xm8w",
    authDomain: "sevateam-70a62.firebaseapp.com",
    projectId: "sevateam-70a62",
    storageBucket: "sevateam-70a62.appspot.com",
    messagingSenderId: "238811674421",
    appId: "1:238811674421:web:ec9526801f6913f3a4fe7c",
    measurementId: "G-Y4JCNLNQ4E"
};

export const initializeFirebase = [
  provideFirebaseApp(() => initializeApp(firebaseConfig)),
  provideAuth(() => getAuth()),
  provideFirestore(() => getFirestore()),
  provideAnalytics(() => getAnalytics()),
];
