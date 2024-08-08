import { Component, OnInit } from '@angular/core';
import { Volunteer, VolunteerService } from 'src/app/services/volunteer.service';

@Component({
  selector: 'app-approve-volunteers',
  templateUrl: './approve-volunteers.component.html',
  styleUrls: ['./approve-volunteers.component.scss'],
})
export class ApproveVolunteersComponent  implements OnInit {
  pendingVolunteers: Volunteer[] = [];

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit() {
    this.fetchPendingVolunteers();
  }

  fetchPendingVolunteers() {
    this.volunteerService.getPendingVolunteers().subscribe(volunteers => {
      this.pendingVolunteers = volunteers;
    });
  }

  approve(volunteer: Volunteer) {
    volunteer.status = 'approved';
    this.volunteerService.updateVolunteer(volunteer).subscribe(() => {
      this.fetchPendingVolunteers();
    });
  }

  reject(volunteer: Volunteer) {
    volunteer.status = 'rejected'; // Or whatever status you use for rejection
    this.volunteerService.updateVolunteer(volunteer).subscribe(() => {
      this.fetchPendingVolunteers();
    });
  }
}