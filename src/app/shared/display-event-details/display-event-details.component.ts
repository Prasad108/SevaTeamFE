import { Component, Input, OnInit } from '@angular/core';
import { Event } from '../../services/event.service';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-display-event-details',
  templateUrl: './display-event-details.component.html',
  styleUrls: ['./display-event-details.component.scss'],
  standalone: true,
  imports: [ IonicModule, CommonModule],

})
export class DisplayEventDetailsComponent  implements OnInit {
  @Input() event: Event | null = null;
  constructor() { }

  ngOnInit() {}

}
