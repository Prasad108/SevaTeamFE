
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CentersComponent } from './centers/centers.component';
import { PocsComponent } from './pocs/pocs.component';
import { EventsComponent } from './events/events.component';
import { FormsModule } from '@angular/forms';
import { ReportsComponent } from './reports/reports.component';
import { SortPipe } from 'src/app/pipe/sort.pipe';
import { EventDetailsComponent } from './events/event-details/event-details.component';
import { EditVolunteerModalComponent } from './events/event-details/edit-volunteer-modal/edit-volunteer-modal.component';

@NgModule({
  declarations: [
    DashboardComponent,
    CentersComponent,
    PocsComponent,
    EventsComponent,
    ReportsComponent,
    EventDetailsComponent,
    EditVolunteerModalComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AdminRoutingModule,
    SortPipe,
  ]
})
export class AdminModule {}