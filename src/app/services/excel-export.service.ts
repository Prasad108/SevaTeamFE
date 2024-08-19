import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class ExcelExportService {
  constructor() {}

  public exportEventDetailsToExcel(eventDetails: any, volunteers: any[]): void {
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();

    // Event Details Sheet
    const eventDetailsSheet = XLSX.utils.json_to_sheet([eventDetails]);
    XLSX.utils.book_append_sheet(workbook, eventDetailsSheet, 'Event Details');
    

    // Volunteers Sheet
    const volunteerData = volunteers.map((v) => ({
      'Volunteer Name': v.volunteer.name,
      'Phone Number': v.volunteer.phoneNumber,
      'Gender': v.volunteer.gender,
      'Age': v.volunteer.age,
      'Center Name': v.center.name,
      'POC Name': v.poc.name,
      'Admin Status': v.assignment.adminApprovalStatus,
      'Admin Comment': v.assignment.adminComment || 'No comments',
      'Arrival Date': v.assignment.volunteerArrivalDate
        ? new Date(v.assignment.volunteerArrivalDate).toLocaleDateString()
        : 'Not provided',
      'Train Number': v.assignment.trainNumber || 'Not provided',
      'POC Comment': v.assignment.pocComment || 'No comments',
      'Slots Selected': v.assignment.slotsSelected.join(', '),
    }));

    const volunteersSheet = XLSX.utils.json_to_sheet(volunteerData);
    XLSX.utils.book_append_sheet(workbook, volunteersSheet, 'Volunteers');

    // Generate Excel File
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // Save Excel File
    this.saveAsExcelFile(excelBuffer, `Event_Details_${eventDetails.name}`);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
  }
}

const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
