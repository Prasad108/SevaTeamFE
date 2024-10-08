import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, CollectionReference, Timestamp, getDoc } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Volunteer } from './volunteer.service';
import { Center } from './center.service';
import { POC } from './poc.service';

export interface EventVolunteerAssignment {
  id?: string;
  volunteer: Volunteer;
  eventId: string;
  center: Center;
  poc: Omit<POC, 'authId' | 'role' | 'initialPassword'> | null;  // Modified POC object
  adminApprovalStatus: 'review-pending' | 'waiting' | 'approved' | 'rejected';
  adminComment: string;
  volunteerArrivalDate?: string | null; 
  pocComment: string;
  trainNumber?: string;
  slotsSelected: string[];
  createdAt: string;
  updatedAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class EventVolunteerAssignmentService {
  private assignmentsCollection: CollectionReference<EventVolunteerAssignment>;

  constructor(private firestore: Firestore) {
    this.assignmentsCollection = collection(this.firestore, 'eventVolunteerAssignments') as CollectionReference<EventVolunteerAssignment>;
  }

  // Fetch all assignments for a specific event
  getAssignmentsForEvent(eventId: string): Observable<EventVolunteerAssignment[]> {
    const q = query(this.assignmentsCollection, where('eventId', '==', eventId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

  // Fetch all assignments for a specific POC
  getAssignmentsForPoc(pocId: string): Observable<EventVolunteerAssignment[]> {
    const q = query(this.assignmentsCollection, where('pocId', '==', pocId));
    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
  }

// Fetch all assignments for a specific POC and event
getAssignmentsForEventByCenter(centerId: string, eventId: string): Observable<EventVolunteerAssignment[]> {
  const q = query(this.assignmentsCollection, 
    where('center.centerId', '==', centerId), 
    where('eventId', '==', eventId)
  );
  return from(getDocs(q)).pipe(
    map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
  );
}

// Add a new assignment
addAssignment(assignment: EventVolunteerAssignment): Observable<EventVolunteerAssignment> {
  const timestamp = new Date().toISOString();
  const assignmentWithTimestamps = { ...assignment, createdAt: timestamp, updatedAt: timestamp };
  return from(addDoc(this.assignmentsCollection, assignmentWithTimestamps)).pipe(
    map(docRef => ({ id: docRef.id, ...assignmentWithTimestamps }))
  );
}

// Update an existing assignment
updateAssignment(assignment: EventVolunteerAssignment): Observable<EventVolunteerAssignment> {
  if (!assignment.id) {
    throw new Error('Assignment ID is required for updating');
  }

  const assignmentDocRef = doc(this.assignmentsCollection, assignment.id);
  const assignmentWithTimestamp = { ...assignment, updatedAt: Timestamp.now() };

  return from(updateDoc(assignmentDocRef, assignmentWithTimestamp)).pipe(
    switchMap(() => from(getDoc(assignmentDocRef))),
    map(docSnapshot => ({ id: docSnapshot.id, ...docSnapshot.data() as EventVolunteerAssignment }))
  );
}

  // Delete an assignment
  deleteAssignment(assignmentId: string): Observable<void> {
    const assignmentDocRef = doc(this.assignmentsCollection, assignmentId);
    return from(deleteDoc(assignmentDocRef)).pipe(
      // map(() => console.log('Assignment deleted successfully'))
    );
  }
}
