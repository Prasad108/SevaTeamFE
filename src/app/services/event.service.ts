import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, CollectionReference, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Slot {
  slotId: string;
  startDate: string;
  endDate: string;
}

export interface Event {
  eventId?: string; // Optional because it will be auto-generated
  name: string;
  startDate: string;
  endDate: string;
  description: string;
  slots?: Slot[];
  registrationStartDate: string;
  registrationEndDate: string;
  locationDetails: string;
  eventManagerName: string;
  eventManagerContactNumber: string;
  eventManagerEmailId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private eventsCollection: CollectionReference<Event>;

  constructor(private firestore: Firestore) {
    this.eventsCollection = collection(this.firestore, 'events') as CollectionReference<Event>;
  }

  // Fetch all events
  getEvents(): Observable<Event[]> {
    return from(getDocs(this.eventsCollection)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          eventId: doc.id,
          ...doc.data()
        }));
      })
    );
  }

  // Add a new event
  addEvent(event: Event): Observable<void> {
    return from(addDoc(this.eventsCollection, event)).pipe(
      map(() => {
        console.log('Event added successfully');
      })
    );
  }

  // Update an existing event
  updateEvent(event: Event): Observable<void> {
    if (!event.eventId) {
      throw new Error('Event ID is required for updating');
    }

    const eventDocRef = doc(this.eventsCollection, event.eventId);

    return from(updateDoc(eventDocRef, {
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      slots: event.slots,
      registrationStartDate: event.registrationStartDate,
      registrationEndDate: event.registrationEndDate,
      locationDetails: event.locationDetails,
      eventManagerName: event.eventManagerName,
      eventManagerContactNumber: event.eventManagerContactNumber,
      eventManagerEmailId: event.eventManagerEmailId,
    })).pipe(
      map(() => {
        console.log('Event updated successfully');
      })
    );
  }

  // Delete an event
  deleteEvent(eventId: string): Observable<void> {
    const eventDocRef = doc(this.eventsCollection, eventId);
    return from(deleteDoc(eventDocRef)).pipe(
      map(() => {
        console.log('Event deleted successfully');
      })
    );
  }

  // Fetch a specific event by its ID
  getEventById(eventId: string): Observable<Event | null> {
    const eventDocRef = doc(this.firestore, `events/${eventId}`);
    return from(getDoc(eventDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { eventId: docSnap.id, ...docSnap.data() } as Event;
        } else {
          return null;
        }
      })
    );
  }
}
