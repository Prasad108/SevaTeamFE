import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { Event as EventModel, EventService } from '../../../../services/event.service';
import { EventVolunteerAssignmentService, EventVolunteerAssignment } from '../../../../services/event-volunteer-assignment.service';
import { VolunteerService, Volunteer } from '../../../../services/volunteer.service';
import { CenterService, Center } from '../../../../services/center.service';
import { PocService, POC } from '../../../../services/poc.service';

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
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const eventId = this.route.snapshot.paramMap.get('eventId');
    if (eventId) {
      this.fetchEventDetails(eventId);
    }
  }

  fetchEventDetails(eventId: string) {
    this.eventService.getEventById(eventId).subscribe(
      (event) => {
        this.event = event;
        this.fetchVolunteerAssignments(eventId);
      },
      (error) => {
        console.error('Error fetching event details:', error);
      }
    );
  }

  fetchVolunteerAssignments(eventId: string) {
    this.assignmentService.getAssignmentsForEvent(eventId).pipe(
      switchMap((assignments) => {
        // Extract unique volunteerIds, centerIds, and pocIds
        const uniqueVolunteerIds = [...new Set(assignments.map(a => a.volunteerId))];
        const uniqueCenterIds = [...new Set(assignments.map(a => a.centerId))];
        const uniquePocIds = [...new Set(assignments.map(a => a.pocId))];

        // Fetch data in parallel using forkJoin
        return forkJoin({
          volunteers: this.volunteerService.getVolunteersByIds(uniqueVolunteerIds),
          centers: this.centerService.getCentersByIds(uniqueCenterIds),
          pocs: this.pocService.getPocsByIds(uniquePocIds)
        }).pipe(
          map((result) => {
            const volunteersMap = new Map(result.volunteers.map(v => [v.volunteerId, v]));
            const centersMap = new Map(result.centers.map(c => [c.centerId, c]));
            const pocsMap = new Map(result.pocs.map(p => [p.pocId, p]));

            // Combine data
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
}
