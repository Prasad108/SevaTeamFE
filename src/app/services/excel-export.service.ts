import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver-es';
import { Event, Slot } from './event.service';
import { EventVolunteerAssignment } from './event-volunteer-assignment.service';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  async exportEventDetailsToExcel(event: Event, assignments: EventVolunteerAssignment[]): Promise<void> {
    const XLSX = await import('xlsx-js-style');
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

    // Add Slots to Event Details
    if (event.slots && event.slots.length > 0) {
      eventDetails.push(['Slots']);
      eventDetails.push(['Slot Id', 'Start Date', 'End Date']); // Add headers for slot details
      event.slots.forEach(slot => {
        eventDetails.push([slot.slotId, slot.startDate, slot.endDate]);
      });
    }

    const eventSheet = XLSX.utils.aoa_to_sheet(eventDetails);

    // Apply styling to the event sheet
    eventSheet['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 30 }];
    eventDetails.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        if (!eventSheet[cellAddress]) return;
        eventSheet[cellAddress].s = {
          font: { bold: rowIndex === 0 || (rowIndex >= eventDetails.length - event.slots!.length - 1 && rowIndex < eventDetails.length - event.slots!.length) }, // Bold headers and slot headers
          alignment: { vertical: 'center', horizontal: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      });
    });

    XLSX.utils.book_append_sheet(workbook, eventSheet, 'Event Details');

    // Volunteers Sheet
    const volunteerData: (string | number)[][] = [
      ['Sr.No', 'Volunteer Name', 'Phone Number', 'Gender', 'Age', 'Center', 'Center Location', 'POC', 'POC Phone Number', 'POC Comment', 'Admin Status', 'Admin Comment', 'Volunteer Arrival Date', 'Train Number', 'Slots Selected', 'Registered On']
    ];

    assignments.forEach((assignment, index) => {
      const row = [
        index + 1,
        assignment.volunteer.name,
        assignment.volunteer.phoneNumber,
        assignment.volunteer.gender,
        assignment.volunteer.age,
        assignment.center.name,
        assignment.center.location,
        assignment.poc ? assignment.poc.name : 'NA', // Add null check here
        assignment.poc ? assignment.poc.phoneNumber : 'NA', // Add null check here
        assignment.pocComment || 'NA',
        assignment.adminApprovalStatus,
        assignment.adminComment || 'NA',
        assignment.volunteerArrivalDate || 'NA',
        assignment.trainNumber || 'NA',
        assignment.slotsSelected.join(', '),
        assignment.createdAt
      ];
      volunteerData.push(row);
    });

    const volunteerSheet = XLSX.utils.aoa_to_sheet(volunteerData);

    // Apply styling to the volunteer sheet
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

    volunteerData.forEach((row, rowIndex) => {
      row.forEach((_, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
        if (!volunteerSheet[cellAddress]) return;
        volunteerSheet[cellAddress].s = {
          font: { bold: rowIndex === 0 }, // Bold the header row
          alignment: { vertical: 'center', horizontal: 'center' },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          }
        };
      });
    });

    XLSX.utils.book_append_sheet(workbook, volunteerSheet, 'Volunteers');

    // Generate Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${event.name}_Event_Details.xlsx`);
  }
}
