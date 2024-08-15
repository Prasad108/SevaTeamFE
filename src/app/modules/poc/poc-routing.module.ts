import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { VolunteersComponent } from './volunteers/volunteers.component';
import { ApproveVolunteersComponent } from './approve-volunteers/approve-volunteers.component';
import { UpdateVolunteersComponent } from './events/update-volunteers/update-volunteers.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'volunteers', component: VolunteersComponent },
  { path: 'events', component: EventsComponent },
  { path: 'approve-volunteers', component: ApproveVolunteersComponent },
  {path: 'events/:eventId/volunteers',component: UpdateVolunteersComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PocRoutingModule { }
