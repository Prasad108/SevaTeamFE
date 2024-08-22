import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PocRoutingModule } from './poc-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { VolunteersComponent } from './volunteers/volunteers.component';
import { FormsModule } from '@angular/forms';
import { ApproveVolunteersComponent } from './approve-volunteers/approve-volunteers.component';
import { UpdateVolunteersComponent } from './events/update-volunteers/update-volunteers.component';
import { LoadingController } from '@ionic/angular';
import { SortPipe } from 'src/app/pipe/sort.pipe';
import { DisplayEventDetailsComponent } from 'src/app/shared/display-event-details/display-event-details.component';


@NgModule({
  declarations: [
    DashboardComponent,
    EventsComponent,
    VolunteersComponent,
    ApproveVolunteersComponent,
    UpdateVolunteersComponent,
  ],
  imports: [
    CommonModule,
    PocRoutingModule,
    IonicModule,
    FormsModule,
    SortPipe,
    DisplayEventDetailsComponent
  ],
  providers: [LoadingController],

})
export class PocModule { }
