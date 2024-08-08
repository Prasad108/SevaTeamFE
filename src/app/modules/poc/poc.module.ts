import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { PocRoutingModule } from './poc-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { VolunteersComponent } from './volunteers/volunteers.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DashboardComponent,
    EventsComponent,
    VolunteersComponent
  ],
  imports: [
    CommonModule,
    PocRoutingModule,
    IonicModule,
    FormsModule,
  ]
})
export class PocModule { }
