import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc } from '@angular/fire/firestore';
import { Center } from './center.service';
import { POC } from './poc.service';
import { Volunteer } from './volunteer.service';
import { EventVolunteerAssignment } from './event-volunteer-assignment.service';
@Injectable({
  providedIn: 'root',
})
export class TestDataService {
  private createdAssignmentIds: string[] = [];

  constructor(private firestore: Firestore) {}

  private saveToLocalStorage(key: string, ids: string[]) {
    localStorage.setItem(key, JSON.stringify(ids));
  }

  private loadFromLocalStorage(key: string): string[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async generateTestData() {
    this.createdAssignmentIds = [];
    const assignmentPromises: Promise<void>[] = [];

    for (let i = 0; i < 25; i++) {
      const center: Center = {
        centerId: `center_${i + 1}` as string,  // Type casting
        name: `Center ${i + 1}`,
        location: `Location ${i + 1}`,
      };

      const poc: POC = {
        pocId: `poc_${i + 1}` as string,  // Type casting
        name: `POC ${i + 1}`,
        email: `poc${i + 1}@example.com`,
        phoneNumber: `100000000${i + 1}`,
        initialPassword: 'password123',
        centerId: center.centerId as string,  // No need for type casting here as centerId is already a string
        role: 'poc',
      };

      for (let j = 0; j < 40; j++) {
        const volunteer: Volunteer = {
          volunteerId: `volunteer_${i + 1}_${j + 1}` as string,  // Type casting
          name: `Volunteer ${i + 1}-${j + 1}`,
          phoneNumber: `200000000${i * 40 + j + 1}`,
          gender: j % 2 === 0 ? 'male' : 'female',
          pocId: poc.pocId as string,  // Type casting
          age: Math.floor(Math.random() * 50) + 18,
          status: 'approved',
          centerId: center.centerId as string,  // Type casting
        };

        // Create EventVolunteerAssignment
        const assignmentRef = doc(collection(this.firestore, 'eventVolunteerAssignments'));
        this.createdAssignmentIds.push(assignmentRef.id);
        const assignment: EventVolunteerAssignment = {
          id: assignmentRef.id,
          volunteer: volunteer,
          eventId: `JfoFbLBL0bDrQRocdiV4`, // Specified eventId
          center: center,
          poc: poc,
          adminApprovalStatus: 'approved',
          adminComment: '',
          volunteerArrivalDate: null,
          pocComment: '',
          trainNumber: '',
          slotsSelected: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        assignmentPromises.push(setDoc(assignmentRef, assignment));
      }
    }

    await Promise.all(assignmentPromises);

    // Save IDs to localStorage
    this.saveToLocalStorage('createdAssignmentIds', this.createdAssignmentIds);

    console.log('Test data generated and saved to localStorage successfully.');
  }

  async deleteTestData() {
    this.createdAssignmentIds = this.loadFromLocalStorage('createdAssignmentIds');

    const deletePromises: Promise<void>[] = [];

    // Delete EventVolunteerAssignments
    this.createdAssignmentIds.forEach((id) => {
      const docRef = doc(this.firestore, 'eventVolunteerAssignments', id);
      deletePromises.push(deleteDoc(docRef));
    });

    await Promise.all(deletePromises);

    // Clear the IDs from localStorage after deletion
    localStorage.removeItem('createdAssignmentIds');

    console.log('Test data deleted successfully and localStorage cleared.');
  }
}
