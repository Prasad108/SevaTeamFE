import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CentersComponent } from './centers/centers.component';
import { PocsComponent } from './pocs/pocs.component';
import { EventsComponent } from './events/events.component';
import { EventDetailsComponent } from './events/event-details/event-details.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'centers',
    component: CentersComponent
  },
  {
    path: 'pocs',
    component: PocsComponent
  },
  {
    path: 'events',
    component: EventsComponent
  },
  { 
    path: 'events/:eventId/details',
    component: EventDetailsComponent 
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
