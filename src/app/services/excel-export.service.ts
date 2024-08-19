import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Event, Slot } from './event.service';
import { EventVolunteerAssignment } from './event-volunteer-assignment.service';
import { Volunteer } from './volunteer.service';
import { Center } from './center.service';
import { POC } from './poc.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  exportEventDetailsToExcel(event: Event, volunteers: { assignment: EventVolunteerAssignment; volunteer: Volunteer; center: Center; poc: POC }[]): void {
    const workbook = XLSX.utils.book_new();

    // Event Details Sheet
    const eventDetails = [
      ['Event Name', event.name],
      ['Start Date', event.startDate],
      ['End Date', event.endDate],
      ['Description', event.description],
      ['Registration Start Date', event.registrationStartDate],
      ['Registration End Date', event.registrationEndDate],
      ['Location', event.locationDetails],
      ['Event Manager Name', event.eventManagerName],
      ['Event Manager Contact Number', event.eventManagerContactNumber],
      ['Event Manager Email', event.eventManagerEmailId]
    ];

    if (event.slots && event.slots.length > 0) {
      eventDetails.push(['Slots']);
      event.slots.forEach(slot => {
        eventDetails.push([`Slot ID: ${slot.slotId}`, `Start: ${slot.startDate}`, `End: ${slot.endDate}`]);
      });
    }

    const eventSheet = XLSX.utils.aoa_to_sheet(eventDetails);

    // Apply some formatting to the event sheet
    eventSheet['!cols'] = [{ wch: 30 }, { wch: 30 }];

    XLSX.utils.book_append_sheet(workbook, eventSheet, 'Event Details');

    // Volunteers Sheet
    const volunteerData: (string | number | null)[][] = [
      ['Sr.No', 'Volunteer Name', 'Phone Number', 'Gender', 'Age', 'Center', 'Center Location', 'POC', 'POC Phone Number', 'POC Comment', 'Admin Status', 'Admin Comment', 'Volunteer Arrival Date', 'Train Number', 'Slots Selected', 'Registered On']
    ];

    volunteers.forEach((data, index) => {
      const row: (string | number | null)[] = [
        index + 1,
        data.volunteer.name,
        data.volunteer.phoneNumber,
        data.volunteer.gender,
        data.volunteer.age,
        data.center.name,
        data.center.location,
        data.poc.name,
        data.poc.phoneNumber,
        data.assignment.pocComment || 'NA',
        data.assignment.adminApprovalStatus,
        data.assignment.adminComment || 'NA',
        data.assignment.volunteerArrivalDate || 'NA',
        data.assignment.trainNumber || 'NA',
        data.assignment.slotsSelected.join(', '),
        data.assignment.createdAt
      ];
      volunteerData.push(row);
    });

    const volunteerSheet = XLSX.utils.aoa_to_sheet(volunteerData);

    // Apply some formatting to the volunteers sheet
    volunteerSheet['!cols'] = [
      { wch: 5 },  // Sr.No
      { wch: 20 }, // Volunteer Name
      { wch: 15 }, // Phone Number
      { wch: 10 }, // Gender
      { wch: 5 },  // Age
      { wch: 20 }, // Center
      { wch: 30 }, // Center Location
      { wch: 20 }, // POC Name
      { wch: 15 }, // POC Phone Number
      { wch: 30 }, // POC Comment
      { wch: 15 }, // Admin Status
      { wch: 30 }, // Admin Comment
      { wch: 20 }, // Volunteer Arrival Date
      { wch: 20 }, // Train Number
      { wch: 25 }, // Slots Selected
      { wch: 20 }  // Registered On
    ];

    XLSX.utils.book_append_sheet(workbook, volunteerSheet, 'Volunteers');

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${event.name}_Event_Details.xlsx`);
  }
}
