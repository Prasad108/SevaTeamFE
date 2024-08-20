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
          adminApprovalStatus: this.getRandomStatus(),
          adminComment: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
          volunteerArrivalDate: new Date().toISOString(),
          pocComment: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu commodo lectus,',
          trainNumber: '9875641230',
          slotsSelected: this.generateRandomSlots(),
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

  private getRandomStatus(): 'approved' | 'rejected' | 'review-pending' | 'waiting' {
    const statuses: ('approved' | 'rejected' | 'review-pending' | 'waiting')[] = ['approved', 'rejected', 'review-pending', 'waiting'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateRandomSlots(): string[] {
    const allSlots = ['Slot-1', 'Slot-2', 'Slot-3', 'Slot-4', 'Slot-5'];
    const selectedSlots: string[] = [];

    // Randomly select between 1 to 5 slots
    const numberOfSlots = Math.floor(Math.random() * allSlots.length) + 1;

    while (selectedSlots.length < numberOfSlots) {
      const randomSlot = allSlots[Math.floor(Math.random() * allSlots.length)];
      if (!selectedSlots.includes(randomSlot)) {
        selectedSlots.push(randomSlot);
      }
    }

    return selectedSlots;
  }

  exportToFile() {
    // Step 1: Read the data from local storage
    const createdAssignmentIds = this.getFromLocalStorage('createdAssignmentIds');
  
    if (!createdAssignmentIds) {
      console.error('No data found in local storage');
      return;
    }
  
    // Step 2: Convert the data to JSON
    const dataToExport = JSON.stringify(createdAssignmentIds);
  
    // Step 3: Create a Blob and download
    const blob = new Blob([dataToExport], { type: 'application/json' }); // For JSON
  
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'createdAssignmentIds.json'; // Specify the file name
  
    // Trigger the download
    document.body.appendChild(a);
    a.click();
  
    // Clean up
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
  
  // Assuming this is your method to get data from local storage
  getFromLocalStorage(key: string): any {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  

}
