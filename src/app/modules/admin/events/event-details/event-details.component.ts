import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Event as EventModel, EventService } from '../../../../services/event.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { VolunteerService, Volunteer } from '../../../../services/volunteer.service';
import { CenterService, Center } from '../../../../services/center.service';
import { PocService, POC } from '../../../../services/poc.service';
import { AlertController, ModalController, LoadingController } from '@ionic/angular';
import { EditVolunteerModalComponent } from './edit-volunteer-modal/edit-volunteer-modal.component';
import { ExcelExportService } from 'src/app/services/excel-export.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.scss']
})
export class EventDetailsComponent implements OnInit {
  event: EventModel | null = null;
  volunteers: { assignment: EventVolunteerAssignment; volunteer: Volunteer; center: Center; poc: POC }[] = [];

  constructor(
    private eventService: EventService,
    private assignmentService: EventVolunteerAssignmentService,
    private volunteerService: VolunteerService,
    private centerService: CenterService,
    private pocService: PocService,
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
        await this.fetchVolunteerAssignments(eventId);
        await loading.dismiss(); // Dismiss loading when done
      },
      async (error) => {
        console.error('Error fetching event details:', error);
        await loading.dismiss(); // Dismiss loading on error
      }
    );
  }

  async fetchVolunteerAssignments(eventId: string) {
    this.assignmentService.getAssignmentsForEvent(eventId).pipe(
      switchMap((assignments) => {
        if (assignments.length === 0) {
          return []; 
        }
        const uniqueVolunteerIds = [...new Set(assignments.map(a => a.volunteerId))];
        const uniqueCenterIds = [...new Set(assignments.map(a => a.centerId))];
        const uniquePocIds = [...new Set(assignments.map(a => a.pocId))];

        return forkJoin({
          volunteers: this.volunteerService.getVolunteersByIds(uniqueVolunteerIds),
          centers: this.centerService.getCentersByIds(uniqueCenterIds),
          pocs: this.pocService.getPocsByIds(uniquePocIds)
        }).pipe(
          map((result) => {
            const volunteersMap = new Map(result.volunteers.map(v => [v.volunteerId, v]));
            const centersMap = new Map(result.centers.map(c => [c.centerId, c]));
            const pocsMap = new Map(result.pocs.map(p => [p.pocId, p]));

            return assignments.map(assignment => ({
              assignment,
              volunteer: volunteersMap.get(assignment.volunteerId)!,
              center: centersMap.get(assignment.centerId)!,
              poc: pocsMap.get(assignment.pocId)!
            }));
          })
        );
      })
    ).subscribe(
      (combinedData) => {
        this.volunteers = combinedData;
      },
      (error) => {
        console.error('Error fetching volunteer assignments:', error);
      }
    );
  }

  async openEditModal(assignment: EventVolunteerAssignment) {
    const volunteer = this.volunteers.find(v => v.assignment.id === assignment.id)?.volunteer;

    const modal = await this.modalController.create({
      component: EditVolunteerModalComponent,
      componentProps: {
        assignment: { ...assignment },
        eventSlots: this.event?.slots,
        volunteerName: volunteer ? volunteer.name : 'Unknown' // Pass the volunteer's name
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
    // Validation before update
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
        // Find the index of the updated assignment in the volunteers array
        const index = this.volunteers.findIndex(v => v.assignment.id === updatedAssignmentFromService.id);
    
        if (index !== -1) {
          // Update the assignment in the volunteers array
          this.volunteers[index].assignment = updatedAssignmentFromService;
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
    await this.fetchEventDetails(eventId);
  }
}

exportToExcel() {
  this.excelExportService.exportEventDetailsToExcel(this.event, this.volunteers);
}

}
