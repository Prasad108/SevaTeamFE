import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Event as EventModel, EventService } from '../../../../services/event.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { EditVolunteerModalComponent } from './edit-volunteer-modal/edit-volunteer-modal.component';
import { ExcelExportService } from 'src/app/services/excel-export.service';
import { Analytics, logEvent } from '@angular/fire/analytics';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  private analytics = inject(Analytics);

  event: EventModel | null = null;
  assignments: EventVolunteerAssignment[] = [];

  filterCenter: string = '';
  filterGender: string = '';
  filterAdminStatus: string = '';
  filterSlots: string[] = [];
  centers: string[] = [];
  filterName: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 10; // Adjust this number to control how many items per page

  constructor(
    private eventService: EventService,
    private assignmentService: EventVolunteerAssignmentService,
    private route: ActivatedRoute,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private excelExportService: ExcelExportService,
  ) {}

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.fetchEventDetails(eventId);
      this.fetchVolunteerAssignments(eventId);
    }
  }

  async fetchEventDetails(eventId: string) {
    const loading = await this.loadingController.create({
      message: 'Loading event details...',
    });
    await loading.present();

    this.eventService.getEventById(eventId).subscribe(
      async (event) => {
        this.event = event;
        await loading.dismiss();
      },
      async (error) => {
        console.error('Error fetching event details:', error);
        await loading.dismiss();
      }
    );
  }

  async fetchVolunteerAssignments(eventId: string) {
    const loading = await this.loadingController.create({
      message: 'Loading volunteer assignments...',
    });
    await loading.present();

    this.assignmentService.getAssignmentsForEvent(eventId).subscribe(
      (assignments) => {
        this.assignments = assignments;
        this.centers = Array.from(new Set(assignments.map(a => a.center?.name).filter(name => name)));
        loading.dismiss();
      },
      (error) => {
        console.error('Error fetching volunteer assignments:', error);
        loading.dismiss();
      }
    );
  }

  async openEditModal(assignment: EventVolunteerAssignment) {
    const modal = await this.modalController.create({
      component: EditVolunteerModalComponent,
      componentProps: {
        assignment: { ...assignment },
        eventSlots: this.event?.slots,
        volunteerName: assignment.volunteer.name
      }
    });
  
    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.updateVolunteerAssignment(result.data);
      }
    });
  
    return await modal.present();
  }

  async updateVolunteerAssignment(updatedAssignment: EventVolunteerAssignment) {
    if (updatedAssignment.adminApprovalStatus === 'rejected' && !updatedAssignment.adminComment) {
      this.showAlert('Validation Error', 'Admin comment is required when rejecting an assignment.');
      return;
    }

    if (updatedAssignment.slotsSelected.length === 0) {
      this.showAlert('Validation Error', 'At least one slot must be selected.');
      return;
    }

    updatedAssignment.updatedAt = new Date().toISOString();

    this.assignmentService.updateAssignment(updatedAssignment).subscribe(
      (updatedAssignmentFromService) => {
        const index = this.assignments.findIndex(a => a.id === updatedAssignmentFromService.id);
        if (index !== -1) {
          this.assignments[index] = updatedAssignmentFromService;
        }
      },
      (error) => {
        console.error('Error updating volunteer assignment:', error);
        this.showAlert('Error', 'Failed to update volunteer assignment.');
      }
    );
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  async refreshPage() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      await this.fetchVolunteerAssignments(eventId);
    }
  }

  exportToExcel() {
    if (this.event && this.assignments.length > 0) {
      this.excelExportService.exportEventDetailsToExcel(this.event, this.assignments);
      logEvent(this.analytics, 'ExportToExcel',{'eventName':this.event.name});

    } else {
      this.showAlert('Export Error', 'There is no data available to export.');
    }
  }

  get filteredAssignments() {
    return this.assignments.filter(assignment =>
      (this.filterCenter === '' || assignment.center.name === this.filterCenter) &&
      (this.filterGender === '' || assignment.volunteer.gender === this.filterGender) &&
      (this.filterAdminStatus === '' || assignment.adminApprovalStatus === this.filterAdminStatus) &&
      (this.filterSlots.length === 0 || this.filterSlots.every(slot => assignment.slotsSelected.includes(slot))) &&
      (this.filterName === '' || this.fuzzySearch(assignment.volunteer.name, this.filterName))
    );
  }

  get paginatedAssignments() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredAssignments.slice(start, end);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredAssignments.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAssignments.length / this.itemsPerPage);
  }

  fuzzySearch(fullName: string, searchTerm: string): boolean {
    const nameParts = fullName.toLowerCase().split(' ');
    const searchParts = searchTerm.toLowerCase().split(' ');
    return searchParts.every(part => nameParts.some(namePart => namePart.includes(part)));
  }

  resetFilters() {
    this.filterCenter = '';
    this.filterGender = '';
    this.filterAdminStatus = '';
    this.filterSlots = [];
    this.filterName = '';
    this.currentPage = 1; // Reset pagination on filter reset
  }


}
